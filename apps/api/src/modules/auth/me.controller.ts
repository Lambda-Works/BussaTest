import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Controller('me')
@UseGuards(AuthGuard)
export class MeController {
  @Get()
  getMe(@Req() req: any) {
    return {
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role,
    };
  }
}
