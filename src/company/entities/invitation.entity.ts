import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/entities/base.entity';
import { User } from 'src/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';

@Entity()
export class Invitation extends BaseEntity {
  @ManyToOne(() => Company, (company) => company.invitations)
  company: Company;

  @ManyToOne(() => User, (user) => user.invitations)
  user: User;

  @ManyToOne(() => User, { nullable: false })
  sender: User;

  @Column({ type: 'boolean', default: false })
  isAccepted: boolean;
}
