import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
    constructor(private prisma: PrismaService) { }

    async create(title: string, message: string) {
        return this.prisma.announcement.create({
            data: {
                title,
                message,
                isActive: true, // Default to true
            },
        });
    }

    // For Admin: Get all announcements
    async findAll() {
        return this.prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    // For Students: Get only active announcements
    async findActive() {
        return this.prisma.announcement.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async remove(id: string) {
        return this.prisma.announcement.delete({
            where: { id },
        });
    }
}
