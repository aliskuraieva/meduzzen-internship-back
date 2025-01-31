import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { PASSWORD_REGEX } from 'src/common/constants/password-regex.constant';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character',
  })
  password: string;
}
