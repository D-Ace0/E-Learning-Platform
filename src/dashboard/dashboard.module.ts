import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import {
  StudentMetrics,
  StudentMetricsSchema,
} from '../schemas/student-metrics.schema';
import {
  InstructorAnalytics,
  InstructorAnalyticsSchema,
} from '../schemas/instructor-analytics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentMetrics.name, schema: StudentMetricsSchema },
    ]),
    MongooseModule.forFeature([
      { name: InstructorAnalytics.name, schema: InstructorAnalyticsSchema },
    ]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
