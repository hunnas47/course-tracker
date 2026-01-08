import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class ActivityService {
    constructor(private prisma: PrismaService) { }

    async logActivity(userId: string, action: ActivityAction, metadata?: string) {
        return this.prisma.activityLog.create({
            data: {
                userId,
                action,
                metadata,
            },
        });
    }

    async getLogs(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { username: true, id: true } }
                }
            }),
            this.prisma.activityLog.count()
        ]);

        return {
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}
