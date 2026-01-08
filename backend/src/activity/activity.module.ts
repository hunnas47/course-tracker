import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [ActivityController],
  providers: [ActivityService],
  imports: [PrismaModule],
  exports: [ActivityService],
})
export class ActivityModule { }
