import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserService } from 'apps/central-web-server/src/api/user/user.service';
import { compare } from 'bcrypt';
import { AUTH_TOKEN_EXPIRATION } from 'libs/constants/src/envs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async generateAuthToken(payload: any) {
    return await this.jwtService.signAsync(payload, {
      expiresIn: AUTH_TOKEN_EXPIRATION,
    } as JwtSignOptions);
  }

  async signIn(email: string, pass: string) {
    const user = await this.usersService
      .findNonDeleted()
      .findOne({ email })
      .select('+password');
    if (!user) {
      throw new BadRequestException('Email not found');
    }
    if (!(await compare(pass, user.password))) {
      throw new BadRequestException('Password is incorrect');
    }
    if (!user.isActive) {
      throw new BadRequestException('Account is inactive');
    }
    const { id } = user;

    const tokenPayload = {
      userId: id,
      email,
      type: user.type,
    };
    const authToken = await this.generateAuthToken(tokenPayload);
    const { password, ...o } = user.toObject();

    return {
      authToken,
      userAuthData: o,
    };
  }
}
