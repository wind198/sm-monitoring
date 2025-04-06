import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from 'apps/central-web-server/src/api/auth/auth.service';
import { LoginDto } from 'apps/central-web-server/src/api/auth/dto/login.dto';
import { setCookieOptions } from 'apps/central-web-server/src/common/constants/others';
import { IsPublic } from 'apps/central-web-server/src/common/decorators/is-public.decorator';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AUTH_TOKEN_KEY } from 'libs/constants/src/keys';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async signIn(
    @Body() signInDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { authToken, userAuthData } = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );

    res.cookie(AUTH_TOKEN_KEY, authToken, setCookieOptions);

    return { user: userAuthData };
  }

  @IsPublic()
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie(AUTH_TOKEN_KEY);
    res.send();
  }
}
