import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectName, Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
    constructor(private prisma: PrismaService) { }

    async createSubject(name: SubjectName) {
        return this.prisma.subject.create({
            data: { name },
        });
    }

    async findAllSubjects() {
        return this.prisma.subject.findMany({
            include: { classes: true },
        });
    }

    async createClass(data: Prisma.ClassCreateInput) {
        return this.prisma.class.create({ data });
    }

    async getClassesBySubject(subjectId: string) {
        return this.prisma.class.findMany({
            where: { subjectId },
            orderBy: { date: 'asc' },
        });
    }
}
