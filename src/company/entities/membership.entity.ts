import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Company } from './company.entity';
import { User } from 'src/entities/user.entity';

@Entity()
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.memberships)
  company: Company;

  @ManyToOne(() => User, (user) => user.memberships)
  user: User;

  @Column()
  role: 'owner' | 'member';
}
