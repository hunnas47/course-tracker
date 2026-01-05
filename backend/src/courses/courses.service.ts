import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectName } from '@prisma/client';

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
            include: {
                classes: { orderBy: { sortOrder: 'asc' } }
            },
        });
    }

    async createClass(data: { title: string; date: string; subjectId: string }) {
        // Get max sortOrder for this subject
        const maxOrder = await this.prisma.class.aggregate({
            where: { subjectId: data.subjectId },
            _max: { sortOrder: true },
        });
        const nextOrder = (maxOrder._max.sortOrder || 0) + 1;

        return this.prisma.class.create({
            data: {
                title: data.title,
                date: new Date(data.date),
                sortOrder: nextOrder,
                subject: { connect: { id: data.subjectId } },
            },
        });
    }

    async updateClass(id: string, data: { title?: string; date?: string }) {
        return this.prisma.class.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.date && { date: new Date(data.date) }),
            },
        });
    }

    async deleteClass(id: string) {
        // First delete all progress records for this class
        await this.prisma.progress.deleteMany({ where: { classId: id } });
        return this.prisma.class.delete({ where: { id } });
    }

    async reorderClasses(subjectId: string, classIds: string[]) {
        // Update sortOrder for each class based on array position
        const updates = classIds.map((classId, index) =>
            this.prisma.class.update({
                where: { id: classId },
                data: { sortOrder: index + 1 },
            })
        );
        return this.prisma.$transaction(updates);
    }

    async getClassesBySubject(subjectId: string) {
        return this.prisma.class.findMany({
            where: { subjectId },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async getAllClasses() {
        return this.prisma.class.findMany({
            include: { subject: true },
            orderBy: [{ subjectId: 'asc' }, { sortOrder: 'asc' }],
        });
    }
}
