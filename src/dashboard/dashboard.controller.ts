import { Controller, Get, Param, Query, Req,Body } from '@nestjs/common';
import { DashboardService } from './dashboard.service';


@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/student/:id')
  async getStudentDashboard(@Param('id')id:string) {
    return this.dashboardService.getStudentDashboard(id);
  }
  @Get('/average-score')
  async getUserAverageScore(
    @Query('user_id') user_id: string,
    @Query('course_id') course_id: string
  ): Promise<{ user_id: string; course_id: string; averageScore: number }> {
    const averageScore = await this.dashboardService.getUserAverageScore(user_id, course_id);

    return {
      user_id,
      course_id,
      averageScore,
    };
    

  }
  @Get('/course/:id')
  async getCourseAnalytics(@Param('id')id:string,@Body() user_role:string){ {
    return this.dashboardService.getCourseAnalytics(id,user_role);
   }
}
}