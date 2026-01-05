import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('courses')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Post('subject')
    @Roles(Role.ADMIN)
    createSubject(@Body() data) {
        return this.coursesService.createSubject(data.name);
    }

    @Post('class')
    @Roles(Role.ADMIN)
    createClass(@Body() data) {
        return this.coursesService.createClass(data);
    }

    @Get('subjects')
    findAllSubjects() {
        return this.coursesService.findAllSubjects();
    }

    @Get('subject/:id/classes')
    getClassesBySubject(@Param('id') id: string) {
        return this.coursesService.getClassesBySubject(id);
    }
}
