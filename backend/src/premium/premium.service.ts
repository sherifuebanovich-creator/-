import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const PREMIUM_TIERS = [
  { tier: 0, name: 'FREE', price: 0, maxGroups: 0, canCreateGroups: false, canReceiveReports: false, label: 'Бесплатно' },
  { tier: 1, name: 'PREMIUM_BASIC', price: 4.99, maxGroups: 1, canCreateGroups: false, canReceiveReports: true, label: 'Premium Basic' },
  { tier: 2, name: 'PREMIUM_STANDARD', price: 9.99, maxGroups: 3, canCreateGroups: false, canReceiveReports: true, label: 'Premium Standard' },
  { tier: 3, name: 'PREMIUM_MAX', price: 19.99, maxGroups: 10, canCreateGroups: true, canReceiveReports: true, label: 'Premium Max' },
] as const;

@Injectable()
export class PremiumService {
  private readonly logger = new Logger(PremiumService.name);

  constructor(private prisma: PrismaService) {}

  getTiers() {
    return PREMIUM_TIERS;
  }

  getTierInfo(subscription: string): typeof PREMIUM_TIERS[number] {
    const found = PREMIUM_TIERS.find(t => t.name === subscription);
    if (!found) {
      this.logger.warn(`Unknown subscription tier "${subscription}", falling back to FREE`);
      return PREMIUM_TIERS[0];
    }
    return found;
  }

  async getUserTier(userId: string): Promise<typeof PREMIUM_TIERS[number]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscription: true, subscriptionEnd: true },
    });
    if (!user) return PREMIUM_TIERS[0];

    if (user.subscriptionEnd && user.subscriptionEnd < new Date()) {
      return PREMIUM_TIERS[0];
    }

    return this.getTierInfo(user.subscription);
  }

  async canCreateGroup(userId: string): Promise<{ allowed: boolean; currentGroups: number; maxGroups: number; tier: number; tierRequired: string }> {
    const tier = await this.getUserTier(userId);
    const maxTier = PREMIUM_TIERS[PREMIUM_TIERS.length - 1];
    if (!tier.canCreateGroups) {
      return { allowed: false, currentGroups: 0, maxGroups: 1, tier: tier.tier, tierRequired: maxTier.label };
    }
    const groupCount = await this.prisma.group.count({ where: { ownerId: userId } });
    const allowed = groupCount < tier.maxGroups;
    return { allowed, currentGroups: groupCount, maxGroups: tier.maxGroups, tier: tier.tier, tierRequired: maxTier.label };
  }

  async subscribe(userId: string, tierName: string, months: number = 1): Promise<any> {
    const tier = PREMIUM_TIERS.find(t => t.name === tierName);
    if (!tier || tier.tier === 0) {
      throw new BadRequestException('Invalid tier');
    }

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const existing = await this.prisma.premiumSubscription.findUnique({
      where: { userId },
    });

    if (existing) {
      await this.prisma.premiumSubscription.update({
        where: { userId },
        data: {
          tier: tier.tier,
          levelName: tier.name,
          endDate,
          price: tier.price * months,
          status: 'active',
        },
      });
    } else {
      await this.prisma.premiumSubscription.create({
        data: {
          userId,
          tier: tier.tier,
          levelName: tier.name,
          endDate,
          price: tier.price * months,
          status: 'active',
        },
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscription: tier.name,
        subscriptionEnd: endDate,
      },
    });

    this.logger.log(`User ${userId} subscribed to ${tier.name} for ${months} months`);
    return { tier: tier.tier, name: tier.name, label: tier.label, endDate, maxGroups: tier.maxGroups, canCreateGroups: tier.canCreateGroups, canReceiveReports: tier.canReceiveReports };
  }

  async cancelSubscription(userId: string) {
    await this.prisma.premiumSubscription.updateMany({
      where: { userId, status: 'active' },
      data: { status: 'cancelled', autoRenew: false },
    });
    return { cancelled: true };
  }

  async getMySubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscription: true, subscriptionEnd: true },
    });
    const sub = await this.prisma.premiumSubscription.findUnique({
      where: { userId },
    });
    const tierInfo = this.getTierInfo(user?.subscription || 'FREE');
    return {
      tier: tierInfo.tier,
      name: user?.subscription || 'FREE',
      label: tierInfo.label,
      endDate: user?.subscriptionEnd,
      maxGroups: tierInfo.maxGroups,
      canCreateGroups: tierInfo.canCreateGroups,
      canReceiveReports: tierInfo.canReceiveReports,
      active: sub?.status === 'active' && (!user?.subscriptionEnd || user.subscriptionEnd > new Date()),
    };
  }
}
