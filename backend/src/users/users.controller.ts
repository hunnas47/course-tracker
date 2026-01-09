import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

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
    create(@Body() data: CreateUserDto) {
        return this.usersService.create(data);
    }

    @Put('change-password')
    async changePassword(@Body() data: any, @Request() req: any) {
        // Note: We use @Request() to get the user from the JWT guard
        // The guard attaches the user payload to req.user
        return this.usersService.changePassword(req.user.userId, data.oldPassword, data.newPassword);
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

    @Post('bulk-delete')
    @Roles(Role.ADMIN)
    bulkDelete(@Body() data: { ids: string[] }) {
        return this.usersService.bulkDelete(data.ids);
    }


}
