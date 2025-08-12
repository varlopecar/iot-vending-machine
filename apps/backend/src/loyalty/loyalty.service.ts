import { Injectable, NotFoundException } from '@nestjs/common';
import { LoyaltyLog, Advantage, HistoryEntry } from './loyalty.schema';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoyaltyService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async addPoints(
    userId: string,
    points: number,
    reason: string,
  ): Promise<LoyaltyLog> {
    // Verify user exists
    const user = await this.authService.getUserById(userId);

    const loyaltyLog = await this.prisma.loyaltyLog.create({
      data: {
        user_id: userId,
        change: points,
        reason,
        created_at: new Date().toISOString(),
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { points: user.points + points },
    });

    return this.mapLog(loyaltyLog);
  }

  async deductPoints(
    userId: string,
    points: number,
    reason: string,
  ): Promise<LoyaltyLog> {
    // Verify user exists and has enough points
    const user = await this.authService.getUserById(userId);

    if (user.points < points) {
      throw new Error('Insufficient points');
    }

    const loyaltyLog = await this.prisma.loyaltyLog.create({
      data: {
        user_id: userId,
        change: -points,
        reason,
        created_at: new Date().toISOString(),
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { points: user.points - points },
    });

    return this.mapLog(loyaltyLog);
  }

  async getLoyaltyHistory(userId: string): Promise<LoyaltyLog[]> {
    const logs = await this.prisma.loyaltyLog.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return logs.map(this.mapLog);
  }

  async getLoyaltyHistoryFormatted(userId: string): Promise<HistoryEntry[]> {
    const logs = await this.getLoyaltyHistory(userId);
    return logs.map((log) => ({
      id: log.id,
      date: new Date(log.created_at).toLocaleDateString('fr-FR'),
      location: this.extractLocationFromReason(log.reason),
      points: log.change,
    }));
  }

  getAvailableAdvantages(): Advantage[] {
    // This would typically come from a database or configuration
    return [
      {
        id: 'petit_snack',
        title: 'Petit Snack',
        description: 'Un petit snack gratuit',
        points: 2,
        image: 'ptit_duo.png',
      },
      {
        id: 'gros_snack',
        title: 'Gros Snack',
        description: 'Un gros snack gratuit',
        points: 4,
        image: 'le_gourmand.png',
      },
      {
        id: 'ptit_duo',
        title: "P'tit Duo",
        description: 'Deux petits snacks',
        points: 3,
        image: 'ptit_duo.png',
      },
      {
        id: 'mix_parfait',
        title: 'Le Mix Parfait',
        description: 'Un snack et une boisson',
        points: 5,
        image: 'le_mix_parfait.png',
      },
      {
        id: 'gourmand',
        title: 'Le Gourmand',
        description: 'Un gros snack et une boisson',
        points: 7,
        image: 'le_gourmand.png',
      },
    ];
  }

  async redeemAdvantage(
    userId: string,
    advantageId: string,
  ): Promise<LoyaltyLog> {
    const advantages = this.getAvailableAdvantages();
    const advantage = advantages.find((adv) => adv.id === advantageId);

    if (!advantage) {
      throw new NotFoundException('Advantage not found');
    }

    // Deduct points for the advantage
    return await this.deductPoints(
      userId,
      advantage.points,
      `Redeemed: ${advantage.title}`,
    );
  }

  async getCurrentPoints(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user?.points ?? 0;
  }

  private extractLocationFromReason(reason: string): string {
    // Extract location from reason string
    // This is a simple implementation - in a real app, you'd have more structured data
    if (reason.includes('Sophia')) return 'Sophia';
    if (reason.includes('Antibes')) return 'Antibes';
    if (reason.includes('Nice')) return 'Nice';
    return 'Unknown';
  }

  private mapLog = (l: any): LoyaltyLog => ({
    id: l.id,
    user_id: l.user_id,
    change: l.change,
    reason: l.reason,
    created_at: l.created_at,
  });
}
