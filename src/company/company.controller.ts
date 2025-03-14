import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Companies')
@Controller('companies')
@UseGuards(AuthGuard(['auth0', 'jwt']))
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company created successfully',
  })
  async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @CurrentUser() user: User,
  ) {
    return this.companyService.createCompany(createCompanyDto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company information' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only owner can update company',
  })
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() user: User,
  ) {
    return this.companyService.updateCompany(+id, updateCompanyDto, user);
  }

  @Patch(':id/visibility')
  @ApiOperation({ summary: 'Change company visibility' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Visibility updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only owner can change visibility',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  async updateCompanyVisibility(
    @Param('id') id: string,
    @Body() updateVisibilityDto: UpdateVisibilityDto,
    @CurrentUser() user: User,
  ) {
    return this.companyService.updateVisibility(
      +id,
      updateVisibilityDto.isVisible,
      user,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company deleted successfully',
  })
  async deleteCompany(@Param('id') id: string, @CurrentUser() user: User) {
    return this.companyService.deleteCompany(+id, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of companies' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of companies per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Companies list retrieved successfully',
  })
  async getAllCompanies(@Query() pagination: PaginationDto) {
    return this.companyService.getAllCompanies(
      Number(pagination.page) || 1,
      Number(pagination.pageSize) || 10,
    );
  }
}
