import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
    providers: [ProgressService],
    controllers: [ProgressController],
    imports: [PrismaModule, ActivityModule],
    exports: [ProgressService],
})
export class ProgressModule { }
