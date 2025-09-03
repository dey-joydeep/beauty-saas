import { IsJWT, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginWithTotpDto {
  @IsJWT()
  @IsNotEmpty()
  tempToken!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  totpCode!: string;
}

