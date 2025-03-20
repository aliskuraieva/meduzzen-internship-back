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
import { InvitationDto } from './dto/invitation.dto';
import { PaginatedCompanies } from 'src/auth/interfaces/paginated-companies.interface';
import { UsersService } from 'src/user/users.service';
import { Invitation } from './entities/invitation.entity';
import { Request } from './entities/request.entity';
import { Membership } from './entities/membership.entity';
import { Role } from './enum/role.enum';

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

    if (companyWithOwner.owner.email !== user.email) {
      throw new ForbiddenException('You are not the owner of this company');
    }
  }

  async createCompany(
    createCompanyDto: CreateCompanyDto,
    currentUser: User,
  ): Promise<Company> {
    const user = await this.usersService.findByEmail(currentUser.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const company = this.companyRepository.create({
      ...createCompanyDto,
      owner: user,
    });

    const savedCompany = await this.companyRepository.save(company);
    this.logger.log(`Created company: ${savedCompany.name}, Owner: ${user.id}`);
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
    userId: number,
  ): Promise<PaginatedCompanies> {
    const queryBuilder = this.companyRepository.createQueryBuilder('company');

    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    queryBuilder.andWhere(
      '(company.isVisible = true OR company.ownerId = :ownerId)',
      { ownerId: userId },
    );

    const [companies, total] = await queryBuilder.getManyAndCount();

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

  async addAdminToCompany(
    companyId: number,
    userId: number,
    sender: User,
  ): Promise<Membership> {
    const company = await this.findCompanyById(companyId);
    await this.ensureOwnership(company.id, sender);

    const user = await this.usersService.findOne(userId);

    const membership = this.membershipRepository.create({
      company,
      user,
      role: Role.ADMIN,
    });

    return await this.membershipRepository.save(membership);
  }

  async removeAdminFromCompany(
    companyId: number,
    userId: number,
    sender: User,
  ): Promise<{ message: string }> {
    const company = await this.findCompanyById(companyId);
    await this.ensureOwnership(company.id, sender);

    const membership = await this.membershipRepository.findOne({
      where: { user: { id: userId }, company: { id: companyId } },
    });

    if (!membership || membership.role !== Role.ADMIN) {
      throw new NotFoundException('User is not an admin');
    }

    await this.membershipRepository.remove(membership);
    return { message: 'Admin removed from company' };
  }

  async getAdminsOfCompany(companyId: number): Promise<Membership[]> {
    const company = await this.findCompanyById(companyId);

    const admins = await this.membershipRepository.find({
      where: { company: { id: companyId }, role: Role.ADMIN },
      relations: ['user'],
    });

    return admins;
  }

  async sendInvitation(
    companyId: number,
    invitationDto: InvitationDto,
    sender: User,
  ): Promise<Invitation> {
    const company = await this.findCompanyById(companyId);
    await this.ensureOwnership(company.id, sender);

    const user = await this.usersService.findOne(invitationDto.userId);

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

  async acceptInvitation(
    invitationId: number,
    companyId: number,
    user: User,
  ): Promise<Membership> {
    const company = await this.findCompanyById(companyId);
    const invitation = await this.invitationRepository.findOne({
      where: {
        id: invitationId,
        company: { id: companyId },
        user: { id: user.id },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const membership = this.membershipRepository.create({
      user,
      company,
    });

    await this.membershipRepository.save(membership);
    await this.invitationRepository.remove(invitation);

    return membership;
  }

  async declineInvitation(
    invitationId: number,
    companyId: number,
    user: User,
  ): Promise<{ message: string }> {
    const company = await this.findCompanyById(companyId);
    const invitation = await this.invitationRepository.findOne({
      where: {
        id: invitationId,
        company: { id: companyId },
        user: { id: user.id },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.invitationRepository.remove(invitation);
    return { message: 'Invitation declined' };
  }

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

  async getUserInvitations(
    companyId: number,
    user: User,
  ): Promise<Invitation[]> {
    const company = await this.findCompanyById(companyId);

    const invitations = await this.invitationRepository.find({
      where: { company: { id: company.id }, user: { id: user.id } },
    });

    if (!invitations) {
      throw new NotFoundException('No invitations found');
    }

    return invitations;
  }

  async getSentInvitations(companyId: number): Promise<Invitation[]> {
    const company = await this.findCompanyById(companyId);

    const invitations = await this.invitationRepository.find({
      where: { company: { id: company.id } },
      relations: ['user', 'sender'],
    });

    if (!invitations) {
      throw new NotFoundException('No sent invitations found');
    }

    return invitations;
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
