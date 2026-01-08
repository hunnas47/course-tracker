import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('progress')
export class ProgressController {
    constructor(private readonly progressService: ProgressService) { }

    // Public endpoint - no auth required for landing page
    @Get('leaderboard')
    getLeaderboard() {
        return this.progressService.getLeaderboard();
    }

    // Admin analytics endpoint
    @Get('analytics')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    getAnalytics() {
        return this.progressService.getAnalytics();
    }

    // Protected endpoints below
    @Post()
    @UseGuards(AuthGuard('jwt'))
    markWatched(@Request() req, @Body() body: { classId: string; isWatched?: boolean }) {
        return this.progressService.markClassWatched(
            req.user.userId,
            body.classId,
            body.isWatched ?? true
        );
    }

    @Get('my-progress')
    @UseGuards(AuthGuard('jwt'))
    getMyProgress(@Request() req) {
        return this.progressService.getUserProgress(req.user.userId);
    }

    @Get('subjects')
    @UseGuards(AuthGuard('jwt'))
    getSubjectsProgress(@Request() req) {
        return this.progressService.getAllSubjectsProgress(req.user.userId);
    }

    @Get('subject/:id')
    @UseGuards(AuthGuard('jwt'))
    getSubjectProgress(@Request() req, @Param('id') subjectId: string) {
        return this.progressService.getSubjectProgress(req.user.userId, subjectId);
    }

    @Get('stats')
    @UseGuards(AuthGuard('jwt'))
    getUserStats(@Request() req) {
        return this.progressService.getUserStats(req.user.userId);
    }
}
