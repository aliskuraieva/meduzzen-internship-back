import { IsEmail, IsNotEmpty, MinLength, Matches, Validate } from 'class-validator';
import { PASSWORD_REGEX } from 'src/common/constants/password-regex.constant';
import { Match } from 'src/common/decorators/match.decorator';

export class RegisterDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character',
  })
  password: string;

  @IsNotEmpty()
  @Validate(Match, ['password'], {
    message: 'Passwords do not match',
  })
  passwordConfirm: string;
}
