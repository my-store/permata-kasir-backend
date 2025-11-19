import { AuthRefreshDto, AuthLoginDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import {
  Controller,
  UseGuards,
  Request,
  Body,
  Post,
  Get,
} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  // Connection test
  @Get('connection-test')
  connectionTest() {
    return { message: "Oke, you're connected!" };
  }

  @Post()
  signIn(@Body() signInDto: AuthLoginDto) {
    return this.service.signIn(signInDto.tlp, signInDto.pass);
  }

  @Post('refresh')
  refreshToken(@Body() data: AuthRefreshDto) {
    return this.service.refresh(data.tlp);
  }

  // PROTECTED ROUTE
  @UseGuards(AuthGuard)
  @Get()
  getProfile(@Request() req) {
    return req.user;
  }
}
