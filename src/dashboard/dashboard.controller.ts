import { Controller, Get, Param, Query, Req,Body } from '@nestjs/common';
import { DashboardService } from './dashboard.service';


@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/student/:id')
  async getStudentDashboard(@Param('id')id:string) {
    return this.dashboardService.getStudentDashboard(id);
  }
  

  //instructor
  @Get('/course/:id')
  async getCourseAnalytics(@Param('id')id:string,@Body() user_role:string){ {
    return this.dashboardService.getCourseAnalytics(id,user_role);
   }
}
}