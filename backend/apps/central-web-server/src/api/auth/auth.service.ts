import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserService } from 'apps/central-web-server/src/api/user/user.service';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async generateAuthToken(payload: any) {
    return await this.jwtService.signAsync(payload, {
      expiresIn: '5m',
    } as JwtSignOptions);
  }

  async generateRefreshToken(payload: any) {
    return await this.jwtService.signAsync(payload, {
      expiresIn: '5m',
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
    const [authToken, refreshToken] = await Promise.all([
      this.generateAuthToken(tokenPayload),
      this.generateRefreshToken(tokenPayload),
    ]);
    const { password, ...o } = user.toObject();

    return {
      authToken,
      refreshToken,
      userAuthData: o,
    };
  }
}
