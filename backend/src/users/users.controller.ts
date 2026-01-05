import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN)
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() data: any) {
        return this.usersService.create(data);
    }

    @Put(':id')
    @Roles(Role.ADMIN)
    update(
        @Param('id') id: string,
        @Body() data: { username?: string; password?: string; mentorName?: string; isActive?: boolean }
    ) {
        return this.usersService.update(id, data);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }
}
