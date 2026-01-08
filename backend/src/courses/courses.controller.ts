import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('courses')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Post('subject')
    @Roles(Role.ADMIN)
    createSubject(@Body() data: { name: string }) {
        return this.coursesService.createSubject(data.name as any);
    }

    @Post('class')
    @Roles(Role.ADMIN)
    createClass(@Body() data: { title: string; date: string; subjectId: string }) {
        return this.coursesService.createClass(data);
    }

    @Put('class/:id')
    @Roles(Role.ADMIN)
    updateClass(@Param('id') id: string, @Body() data: { title?: string; date?: string }) {
        return this.coursesService.updateClass(id, data);
    }

    @Delete('class/:id')
    @Roles(Role.ADMIN)
    deleteClass(@Param('id') id: string) {
        return this.coursesService.deleteClass(id);
    }

    @Post('reorder')
    @Roles(Role.ADMIN)
    reorderClasses(@Body() data: { subjectId: string; classIds: string[] }) {
        return this.coursesService.reorderClasses(data.subjectId, data.classIds);
    }

    @Get('subjects')
    findAllSubjects() {
        return this.coursesService.findAllSubjects();
    }

    @Get('classes')
    @Roles(Role.ADMIN)
    getAllClasses() {
        return this.coursesService.getAllClasses();
    }

    @Get('subject/:id/classes')
    getClassesBySubject(@Param('id') id: string) {
        return this.coursesService.getClassesBySubject(id);
    }

    @Post('classes/bulk-delete')
    @Roles(Role.ADMIN)
    bulkDeleteClasses(@Body() data: { ids: string[] }) {
        return this.coursesService.bulkDeleteClasses(data.ids);
    }
}
