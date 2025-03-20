import { Entity, Column, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from 'src/entities/base.entity';
import { User } from 'src/entities/user.entity';
import { Invitation } from 'src/company/entities/invitation.entity';
import { Request } from 'src/company/entities/request.entity';
import { Membership } from 'src/company/entities/membership.entity';

@Entity()
export class Company extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.companies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ default: true })
  isVisible: boolean;

  @OneToMany(() => Invitation, (invitation) => invitation.company)
  invitations: Invitation[];

  @OneToMany(() => Request, (request) => request.company)
  requests: Request[];

  @OneToMany(() => Membership, (membership) => membership.company)
  memberships: Membership[];

  @ManyToMany(() => User)
  @JoinTable()
  admins: User[];
}
