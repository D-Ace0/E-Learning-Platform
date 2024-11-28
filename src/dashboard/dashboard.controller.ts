import { Controller, Get, Param, Query, Req,Body, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Roles } from 'src/decorators/roles.decorator';



//@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  //@Roles(['student'])
  @Get('/student/:id')
  async getStudentDashboard(@Param('id')id:string) {
    return this.dashboardService.getStudentDashboard(id);
  }


  //instructor
  @Get('/course/:id')
  async getCourseAnalytics(@Param('id')id:string){ {
    return this.dashboardService.getCourseAnalytics(id);
  }
  }
}