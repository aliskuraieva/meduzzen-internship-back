import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { Company } from './entities/company.entity';
import { User } from 'src/entities/user.entity';
import { Invitation } from './entities/invitation.entity';
import { Request } from './entities/request.entity';
import { Membership } from './entities/membership.entity';
import { UsersModule } from 'src/user/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User, Invitation, Request, Membership]),
    UsersModule,
  ],
  providers: [CompanyService],
  controllers: [CompanyController],
})
export class CompanyModule {}
