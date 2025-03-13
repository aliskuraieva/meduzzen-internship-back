import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/entities/base.entity';
import { User } from 'src/entities/user.entity';

@Entity()
export class Company extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.companies, { onDelete: 'CASCADE' })
  owner: User;

  @Column({ default: true })
  isVisible: boolean;
}
