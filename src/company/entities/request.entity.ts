import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/entities/base.entity';
import { Company } from './company.entity';
import { User } from 'src/entities/user.entity';
import { RequestStatus } from '../enum/request-status.enum';

@Entity()
export class Request extends BaseEntity {
  @ManyToOne(() => Company, (company) => company.requests)
  company: Company;

  @ManyToOne(() => User, (user) => user.requests)
  user: User;

  @ManyToOne(() => User, { nullable: false })
  sender: User;

  @Column({ type: 'enum', enum: RequestStatus })
  status: RequestStatus;
}   