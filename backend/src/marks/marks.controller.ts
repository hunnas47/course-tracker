import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { MarksService } from './marks.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('marks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MarksController {
    constructor(private readonly marksService: MarksService) { }

    @Post('assignment')
    @Roles(Role.ADMIN)
    createAssignment(@Body() data) {
        return this.marksService.createAssignment(data);
    }

    @Post('exam')
    @Roles(Role.ADMIN)
    createExam(@Body() data) {
        return this.marksService.createExam(data);
    }

    @Post('assignment-score')
    @Roles(Role.ADMIN)
    addAssignmentScore(@Body() data) {
        return this.marksService.addAssignmentScore(data.userId, data.assignmentId, data.score);
    }

    @Post('exam-score')
    @Roles(Role.ADMIN)
    addExamScore(@Body() data) {
        return this.marksService.addExamScore(data.userId, data.examId, data.score);
    }

    @Get('my-marks')
    getMyMarks(@Request() req) {
        return this.marksService.getStudentMarks(req.user.userId);
    }
}
