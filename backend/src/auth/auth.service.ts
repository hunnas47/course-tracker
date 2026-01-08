import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private activityService: ActivityService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id, role: user.role };

        // Log activity (fire and forget to not block login)
        this.activityService.logActivity(user.id, ActivityAction.LOGIN);

        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(user: any) {
        return this.usersService.create(user);
    }

    async logout(userId: string) {
        return this.activityService.logActivity(userId, ActivityAction.LOGOUT);
    }
}
