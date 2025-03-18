import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Company } from 'src/company/entities/company.entity';
import { Invitation } from 'src/company/entities/invitation.entity';
import { Request } from 'src/company/entities/request.entity';
import { Membership } from 'src/company/entities/membership.entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  @IsNotEmpty()
  username: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ select: false })
  @MinLength(8)
  password: string;

  @OneToMany(() => Company, (company) => company.owner)
  companies: Company[];

  @OneToMany(() => Invitation, (invitation) => invitation.user)
  invitations: Invitation[];

  @OneToMany(() => Request, (request) => request.user)
  requests: Request[];

  @OneToMany(() => Membership, (membership) => membership.user)
  memberships: Membership[];
}
