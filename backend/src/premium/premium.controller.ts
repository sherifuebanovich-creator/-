import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PremiumService } from './premium.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Premium')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('premium')
export class PremiumController {
  constructor(private premiumService: PremiumService) {}

  @Get('tiers')
  @ApiOperation({ summary: 'Get all premium tiers' })
  getTiers() {
    return this.premiumService.getTiers();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my subscription info' })
  getMy(@CurrentUser('id') userId: string) {
    return this.premiumService.getMySubscription(userId);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to a premium tier' })
  subscribe(
    @CurrentUser('id') userId: string,
    @Body() body: { tierName: string; months?: number },
  ) {
    return this.premiumService.subscribe(userId, body.tierName, body.months || 1);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  cancel(@CurrentUser('id') userId: string) {
    return this.premiumService.cancelSubscription(userId);
  }

  @Get('can-create-group')
  @ApiOperation({ summary: 'Check if user can create a group' })
  canCreateGroup(@CurrentUser('id') userId: string) {
    return this.premiumService.canCreateGroup(userId);
  }
}
