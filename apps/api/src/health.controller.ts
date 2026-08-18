import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';
import { Public } from './modules/auth/public.decorator';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  }
}
