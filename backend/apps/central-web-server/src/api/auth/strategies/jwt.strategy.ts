import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JWT_SECRET } from 'libs/constants/src/envs';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserType } from '../../user/schemas/user.schema';
import { Request } from 'express';
import { AUTH_TOKEN_KEY } from 'libs/constants/src/keys';

export type IJwtPayload = {
  userId: string;
  email: string;
  type: IUserType;
};

export type IExpressRequestUser = IJwtPayload & {};

// declare express request
declare module 'express' {
  interface Request {
    user: IExpressRequestUser;
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const cookie = request.cookies[AUTH_TOKEN_KEY];
          return cookie ? cookie : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  validate(payload: IJwtPayload) {
    return {
      userId: payload.userId,
      email: payload.email,
      type: payload.type,
    };
  }
}
