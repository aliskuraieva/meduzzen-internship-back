import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

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

}
