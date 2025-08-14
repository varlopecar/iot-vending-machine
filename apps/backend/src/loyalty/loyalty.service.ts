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
  ): Promise<HistoryEntry> {
    const user = await this.authService.getUserById(userId);
    await this.prisma.user.update({
      where: { id: userId },
      data: { points: user.points + points },
    });
    return {
      id: `virt_add_${Date.now()}`,
      date: new Date().toISOString(),
      location: this.extractLocationFromReason(reason),
      points,
    };
  }

  async deductPoints(
    userId: string,
    points: number,
    reason: string,
  ): Promise<HistoryEntry> {
    const user = await this.authService.getUserById(userId);
    if (user.points < points) {
      throw new Error('Insufficient points');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { points: user.points - points },
    });
    return {
      id: `virt_deduct_${Date.now()}`,
      date: new Date().toISOString(),
      location: this.extractLocationFromReason(reason),
      points: -points,
    };
  }

  async getLoyaltyHistory(userId: string): Promise<LoyaltyLog[]> {
    // Historique dérivé des commandes: points_spent (négatif) et points_earned (positif)
    const orders = await this.prisma.order.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    const entries: LoyaltyLog[] = [];
    for (const o of orders as any[]) {
      if (((o.points_spent ?? 0) as number) > 0) {
        entries.push({
          id: `order_${o.id}_spent`,
          user_id: userId,
          change: -((o.points_spent ?? 0) as number),
          reason: `Redeemed: order ${o.id}`,
          created_at: o.created_at,
        });
      }
      if (((o.points_earned ?? 0) as number) > 0) {
        entries.push({
          id: `order_${o.id}_earned`,
          user_id: userId,
          change: (o.points_earned ?? 0) as number,
          reason: `Purchase credit: order ${o.id}`,
          created_at: o.created_at,
        });
      }
    }
    // Tri décroissant par date
    entries.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return entries;
  }

  async getLoyaltyHistoryFormatted(userId: string): Promise<HistoryEntry[]> {
    // Recalcul direct à partir des commandes, avec nom de machine
    const orders = await this.prisma.order.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        machine: { select: { label: true, location: true } },
      },
    });

    const entries: HistoryEntry[] = [];
    for (const o of orders) {
      const location = (o as any).machine?.label || (o as any).machine?.location || 'Unknown';
      if (((o as any).points_spent ?? 0) > 0) {
        entries.push({
          id: `order_${o.id}_spent`,
          date: new Date(o.created_at).toLocaleDateString('fr-FR'),
          location,
          points: -(((o as any).points_spent ?? 0)),
        });
      }
      if (((o as any).points_earned ?? 0) > 0) {
        entries.push({
          id: `order_${o.id}_earned`,
          date: new Date(o.created_at).toLocaleDateString('fr-FR'),
          location,
          points: ((o as any).points_earned ?? 0),
        });
      }
    }

    return entries;
  }

  async getLoyaltyHistoryPaged(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<{ entries: HistoryEntry[]; nextOffset: number | null }> {
    const all = await this.getLoyaltyHistoryFormatted(userId);
    const slice = all.slice(offset, offset + limit);
    const nextOffset = offset + limit < all.length ? offset + limit : null;
    return { entries: slice, nextOffset };
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
  ): Promise<HistoryEntry> {
    const advantages = this.getAvailableAdvantages();
    const advantage = advantages.find((adv) => adv.id === advantageId);
    if (!advantage) {
      throw new NotFoundException('Advantage not found');
    }
    // Ne pas décrémenter ici : le débit se fera lors de la création de la commande via points_spent
    return {
      id: `virt_adv_${advantage.id}_${Date.now()}`,
      date: new Date().toISOString(),
      location: `Avantage sélectionné: ${advantage.title}`,
      points: 0,
    };
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
