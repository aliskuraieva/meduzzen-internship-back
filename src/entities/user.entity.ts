import { Entity, Column, BeforeInsert } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import * as bcrypt from 'bcryptjs';

@Entity()
export class User extends BaseEntity {
  @Column()
  @IsNotEmpty()
  username: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @MinLength(6)
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
