import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { User } from '../entities/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PaginatedCompanies } from 'src/auth/interfaces/paginated-companies.interface';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  private ensureOwnership(company: Company, user: User): void {
    if (company.owner.id !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to perform this action on this company',
      );
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
      `Created company: ${savedCompany.name}, Owner: ${owner.email}`,
    );
    return savedCompany;
  }

  private async findCompanyById(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
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
    this.ensureOwnership(company, user);

    Object.assign(company, updateCompanyDto);
    const updatedCompany = await this.companyRepository.save(company);
    this.logger.log(`Updated company: ${updatedCompany.name}`);
    return updatedCompany;
  }

  async deleteCompany(id: number, user: User): Promise<{ message: string }> {
    const company = await this.findCompanyById(id);
    this.ensureOwnership(company, user);

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
    this.ensureOwnership(company, user);

    if (typeof isVisible !== 'boolean') {
      throw new ForbiddenException('Invalid value for visibility');
    }

    company.isVisible = isVisible;
    const updatedCompany = await this.companyRepository.save(company);
    this.logger.log(`Updated visibility for company: ${company.name}`);
    return updatedCompany;
  }
}
