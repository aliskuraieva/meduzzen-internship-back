import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { User } from '../entities/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PaginatedCompanies } from 'src/auth/interfaces/paginated-companies.interface';
import { UsersService } from 'src/user/users.service';
import { Invitation } from './entities/invitation.entity';
import { Request } from './entities/request.entity';
import { Membership } from './entities/membership.entity';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
    private usersService: UsersService,
  ) {}

  async ensureOwnership(companyId: number, user: User) {
    const companyWithOwner = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['owner'],
    });

    if (!companyWithOwner || !companyWithOwner.owner) {
      throw new NotFoundException('Company or owner not found');
    }

    if (companyWithOwner.owner.id !== user.id) {
      throw new ForbiddenException('You are not the owner of this company');
    }
  }

  async createCompany(
    createCompanyDto: CreateCompanyDto,
    owner: User,
  ): Promise<Company> {
    const company = this.companyRepository.create({
      ...createCompanyDto,
      owner,
    });

    const savedCompany = await this.companyRepository.save(company);
    this.logger.log(
      `Created company: ${savedCompany.name}, Owner: ${owner.id}`,
    );
    return savedCompany;
  }

  async findCompanyById(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async updateCompany(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
    user: User,
  ): Promise<Company> {
    const company = await this.findCompanyById(id);
    await this.ensureOwnership(company.id, user);

    Object.assign(company, updateCompanyDto);
    const updatedCompany = await this.companyRepository.save(company);
    this.logger.log(`Updated company: ${updatedCompany.name}`);
    return updatedCompany;
  }

  async deleteCompany(id: number, user: User): Promise<{ message: string }> {
    const company = await this.findCompanyById(id);
    await this.ensureOwnership(company.id, user);

    await this.companyRepository.remove(company);
    this.logger.log(`Deleted company: ${company.name}`);
    return { message: 'Company deleted' };
  }

  async getAllCompanies(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedCompanies> {
    const [companies, total] = await this.companyRepository.findAndCount({
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    return { companies, total, page, pageSize };
  }

  async updateVisibility(
    id: number,
    isVisible: boolean,
    user: User,
  ): Promise<Company> {
    const company = await this.findCompanyById(id);
    await this.ensureOwnership(company.id, user);

    if (typeof isVisible !== 'boolean') {
      throw new ForbiddenException('Invalid value for visibility');
    }

    company.isVisible = isVisible;
    const updatedCompany = await this.companyRepository.save(company);

    this.logger.log(`Updated visibility for company: ${company.name}`);
    return updatedCompany;
  }

  // Manage Invitations

  async sendInvitation(
    companyId: number,
    userId: number,
    sender: User,
  ): Promise<Invitation> {
    const company = await this.findCompanyById(companyId);
    await this.ensureOwnership(company.id, sender);

    const user = await this.usersService.findOne(userId);

    const invitation = this.invitationRepository.create({
      company,
      user,
      sender,
    });

    return await this.invitationRepository.save(invitation);
  }

  async cancelInvitation(
    invitationId: number,
    sender: User,
  ): Promise<{ message: string }> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['company', 'sender'],
    });

    if (!invitation || invitation.sender.id !== sender.id) {
      throw new ForbiddenException('You can only cancel your own invitations');
    }

    await this.invitationRepository.remove(invitation);
    return { message: 'Invitation canceled' };
  }

  // Manage Requests

  async sendRequestToJoin(companyId: number, user: User): Promise<Request> {
    const company = await this.findCompanyById(companyId);

    const request = this.requestRepository.create({
      company,
      user,
    });

    return await this.requestRepository.save(request);
  }

  async cancelRequestToJoin(
    requestId: number,
    user: User,
  ): Promise<{ message: string }> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['company', 'user'],
    });

    if (!request || request.user.id !== user.id) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    await this.requestRepository.remove(request);
    return { message: 'Request canceled' };
  }

  async acceptRequestToJoin(
    requestId: number,
    companyId: number,
    owner: User,
  ): Promise<Membership> {
    const company = await this.findCompanyById(companyId);
    await this.ensureOwnership(company.id, owner);

    const request = await this.requestRepository.findOne({
      where: { id: requestId, company: { id: companyId } },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const membership = this.membershipRepository.create({
      user: request.user,
      company,
    });

    await this.membershipRepository.save(membership);
    await this.requestRepository.remove(request);

    return membership;
  }

  async declineRequestToJoin(
    requestId: number,
    companyId: number,
    owner: User,
  ): Promise<{ message: string }> {
    const company = await this.findCompanyById(companyId);
    await this.ensureOwnership(company.id, owner);

    const request = await this.requestRepository.findOne({
      where: { id: requestId, company: { id: companyId } },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    await this.requestRepository.remove(request);
    return { message: 'Request declined' };
  }

  // Remove users from company
  async removeUserFromCompany(
    companyId: number,
    userId: number,
    owner: User,
  ): Promise<{ message: string }> {
    const company = await this.findCompanyById(companyId);
    await this.ensureOwnership(company.id, owner);

    const membership = await this.membershipRepository.findOne({
      where: { user: { id: userId }, company: { id: companyId } },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this company');
    }

    await this.membershipRepository.remove(membership);
    return { message: 'User removed from company' };
  }

  // Leave company
  async leaveCompany(
    companyId: number,
    user: User,
  ): Promise<{ message: string }> {
    const company = await this.findCompanyById(companyId);

    const membership = await this.membershipRepository.findOne({
      where: { user: { id: user.id }, company: { id: companyId } },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this company');
    }

    await this.membershipRepository.remove(membership);
    return { message: 'Successfully left the company' };
  }
}
