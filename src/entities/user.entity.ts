import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Company } from 'src/company/company.entity';

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

  @OneToMany(() => Company, (company) => company.owner, { cascade: true })
  companies: Company[];
}
