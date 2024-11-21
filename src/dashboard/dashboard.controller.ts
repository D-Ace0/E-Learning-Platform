import { Controller, Get, Res, Query, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Response } from 'express';
import { Roles } from '../decorators/roles.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('student/:userId')
  @Roles(['student'])
  async getStudentMetrics(@Param('userId') userId: string) {
    return this.dashboardService.getStudentMetrics(userId);
  }

  @Get('instructor/:instructorId')
  @Roles(['instructor'])
  async getInstructorAnalytics(@Param('instructorId') instructorId: string) {
    return this.dashboardService.getInstructorAnalytics(instructorId);
  }

  @Get('analytics/download')
  //@Roles(['admin','instructor']) ??
  async downloadAnalyticsReport(
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const report = await this.dashboardService.downloadAnalyticsReport(format);
    res.set({
      'Content-Type': format === 'pdf' ? 'application/pdf' : 'text/csv',
      'Content-Disposition': `attachment; filename=report.${format}`,
    });
    res.send(report);
  }
}
