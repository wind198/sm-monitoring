import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from 'apps/central-web-server/src/api/auth/auth.service';
import { LoginDto } from 'apps/central-web-server/src/api/auth/dto/login.dto';
import { REFRESH_TOKEN } from 'apps/central-web-server/src/common/constants/keys';
import { setCookieOptions } from 'apps/central-web-server/src/common/constants/others';
import { IsPublic } from 'apps/central-web-server/src/common/decorators/is-public.decorator';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @IsPublic()
  @Post('login')
  async signIn(
    @Body() signInDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { authToken, refreshToken, userAuthData } =
      await this.authService.signIn(signInDto.email, signInDto.password);

    res.cookie(REFRESH_TOKEN, refreshToken, setCookieOptions);

    return { token: authToken, user: userAuthData };
  }

  @IsPublic()
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie(REFRESH_TOKEN);
    res.send();
  }
}
