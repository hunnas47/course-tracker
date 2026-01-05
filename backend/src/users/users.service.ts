import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: any): Promise<User> {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(data.password, salt);
        const { password, ...rest } = data;
        return this.prisma.user.create({
            data: {
                ...rest,
                passwordHash,
            },
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            where: { role: 'STUDENT' },
            select: {
                id: true,
                username: true,
                mentorName: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { username },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: { username?: string; password?: string; mentorName?: string; isActive?: boolean }) {
        const updateData: any = {};

        if (data.username) updateData.username = data.username;
        if (data.mentorName !== undefined) updateData.mentorName = data.mentorName;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        if (data.password) {
            const salt = await bcrypt.genSalt();
            updateData.passwordHash = await bcrypt.hash(data.password, salt);
        }

        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                username: true,
                mentorName: true,
                isActive: true,
                createdAt: true,
            },
        });
    }

    async delete(id: string) {
        // Delete all related records first
        await this.prisma.progress.deleteMany({ where: { userId: id } });
        await this.prisma.assignmentScore.deleteMany({ where: { userId: id } });
        await this.prisma.examScore.deleteMany({ where: { userId: id } });

        return this.prisma.user.delete({ where: { id } });
    }
}
