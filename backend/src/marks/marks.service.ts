import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MarksService {
    constructor(private prisma: PrismaService) { }

    async createAssignment(data: Prisma.AssignmentCreateInput) {
        return this.prisma.assignment.create({ data });
    }

    async createExam(data: Prisma.ExamCreateInput) {
        return this.prisma.exam.create({ data });
    }

    async addAssignmentScore(userId: string, assignmentId: string, score: number) {
        return this.prisma.assignmentScore.upsert({
            where: { userId_assignmentId: { userId, assignmentId } },
            update: { score },
            create: { userId, assignmentId, score },
        });
    }

    async addExamScore(userId: string, examId: string, score: number) {
        return this.prisma.examScore.upsert({
            where: { userId_examId: { userId, examId } },
            update: { score },
            create: { userId, examId, score },
        });
    }

    async getStudentMarks(userId: string) {
        const assignments = await this.prisma.assignmentScore.findMany({
            where: { userId },
            include: { assignment: true },
        });
        const exams = await this.prisma.examScore.findMany({
            where: { userId },
            include: { exam: true },
        });
        return { assignments, exams };
    }
}
