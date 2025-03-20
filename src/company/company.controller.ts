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
  Request,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';
import { InvitationDto } from './dto/invitation.dto';
import { RequestDto } from './dto/request.dto';
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
  async getAllCompanies(
    @Query() pagination: PaginationDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.companyService.getAllCompanies(
      Number(pagination.page) || 1,
      Number(pagination.pageSize) || 10,
      userId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  async findCompanyById(@Param('id') id: string) {
    return this.companyService.findCompanyById(+id);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite a user to a company' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invitation sent successfully',
  })
  async inviteUserToCompany(
    @Param('id') companyId: string,
    @Body() invitationDto: InvitationDto,
    @CurrentUser() user: User,
  ) {
    return this.companyService.sendInvitation(+companyId, invitationDto, user);
  }

  @Delete(':id/invite/:userId')
  @ApiOperation({ summary: 'Cancel invitation to a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invitation canceled successfully',
  })
  async cancelInvitation(
    @Param('id') companyId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: User,
  ) {
    return this.companyService.cancelInvitation(+companyId, user);
  }

  @Patch(':id/invite/:userId/accept')
  @ApiOperation({ summary: 'Accept invitation to a company' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invitation accepted successfully',
  })
  async acceptInvitation(
    @Param('id') companyId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: User,
  ) {
    return this.companyService.acceptInvitation(+companyId, +userId, user);
  }

  @Patch(':id/invite/:userId/decline')
  @ApiOperation({ summary: 'Decline invitation to a company' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invitation declined successfully',
  })
  async declineInvitation(
    @Param('id') companyId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: User,
  ) {
    return this.companyService.declineInvitation(+companyId, +userId, user);
  }

  @Get(':id/invitations')
  @ApiOperation({ summary: 'Get list of invitations to a company' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of invitations retrieved successfully',
  })
  async getUserInvitations(
    @Param('id') companyId: string,
    @CurrentUser() user: User,
  ) {
    return this.companyService.getUserInvitations(+companyId, user);
  }

  @Get(':id/invitations/sent')
  @ApiOperation({ summary: 'Get list of sent invitations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of sent invitations retrieved successfully',
  })
  async getSentInvitations(
    @Param('id') companyId: string,
    @CurrentUser() user: User,
  ) {
    return this.companyService.getSentInvitations(+companyId);
  }

  @Post(':id/request')
  @ApiOperation({ summary: 'Request to join a company' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Request sent successfully',
  })
  async sendJoinRequest(
    @Param('id') companyId: string,
    @Body() requestDto: RequestDto,
    @CurrentUser() user: User,
  ) {
    return this.companyService.sendRequestToJoin(+companyId, user);
  }

  @Delete(':id/request/:userId')
  @ApiOperation({ summary: 'Cancel join request' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Join request canceled successfully',
  })
  async cancelJoinRequest(
    @Param('id') companyId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: User,
  ) {
    return this.companyService.cancelRequestToJoin(+userId, user);
  }

  @Patch(':id/request/:userId/accept')
  @ApiOperation({ summary: 'Accept join request' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Join request accepted successfully',
  })
  async acceptJoinRequest(
    @Param('id') companyId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: User,
  ) {
    return this.companyService.acceptRequestToJoin(+companyId, +userId, user);
  }

  @Patch(':id/request/:userId/decline')
  @ApiOperation({ summary: 'Decline join request' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Join request declined successfully',
  })
  async declineJoinRequest(
    @Param('id') companyId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: User,
  ) {
    return this.companyService.declineRequestToJoin(+companyId, +userId, user);
  }

  @Delete(':id/user/:userId')
  @ApiOperation({ summary: 'Remove user from company' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User removed from company successfully',
  })
  async removeUserFromCompany(
    @Param('id') companyId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: User,
  ) {
    return this.companyService.removeUserFromCompany(+companyId, +userId, user);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave a company' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User left company successfully',
  })
  async leaveCompany(
    @Param('id') companyId: string,
    @CurrentUser() user: User,
  ) {
    return this.companyService.leaveCompany(+companyId, user);
  }
}
