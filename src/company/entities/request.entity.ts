import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Company } from './company.entity';
import { User } from 'src/entities/user.entity';

@Entity()
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.requests)
  company: Company;

  @ManyToOne(() => User, (user) => user.requests)
  user: User;

  @Column()
  status: 'pending' | 'accepted' | 'declined';
}
