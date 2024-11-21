import { Injectable } from '@nestjs/common';
import { StudentMetricsDTO } from './dto/student-metrics.dto';
import { InstructorAnalyticsDto } from './dto/instructor-analytics.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StudentMetrics,
  StudentMetricsDocument,
} from '../schemas/student-metrics.schema';
import {
  InstructorAnalytics,
  InstructorAnalyticsDocument,
} from '../schemas/instructor-analytics.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(StudentMetrics.name)
    private studentMetricsModel: Model<StudentMetricsDocument>,
    @InjectModel(InstructorAnalytics.name)
    private instructorAnalyticsModel: Model<InstructorAnalyticsDocument>,
  ) {}

  async getStudentMetrics(userId: string): Promise<StudentMetricsDTO> {
    const metrics = await this.studentMetricsModel
      .findOne({ user_id: userId })
      .exec();
    return {
      courseCompletionRates: metrics.completionRate,
      averageScores: metrics.averageScore,
      engagementTrends: metrics.engagementTrends,
    };
  }

  async getInstructorAnalytics(
    instructorId: string,
  ): Promise<InstructorAnalyticsDto> {
    const analytics = await this.instructorAnalyticsModel
      .findOne({ instructor_id: instructorId })
      .exec();
    return {
      studentEngagementTrends: analytics.studentEngagementTrends,
      quizPerformance: analytics.quizPerformance,
      challengingModules: analytics.challengingModules,
    };
  }

  async downloadAnalyticsReport(format: string): Promise<Buffer> {
    return Buffer.from('Report content');
  }
}
