import { Controller, Get, Param, Query, Req,Body, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { ResourceAccessGuard } from 'src/guards/resource-access.guard';



@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

 @Roles(['student'])
  @Get('/student/:id')
  async getStudentDashboard(@Param('id')id:string) {
    return this.dashboardService.getStudentDashboard(id);
  }
  
//123 << instructor id
//1234 << user id
  //instructor
  // it takes data from user_interaction schema..
  @Roles(['instructor'])
  @Get('/course/:id')
  async getCourseAnalytics(@Param('id')id:string ){ {
    return this.dashboardService.getCourseAnalytics(id);
   }
}
  @Get('/course/:courseId/user') // Updated route to include both userId and courseId
  async getCourseForStudentAnalytics(
    @Param('courseId') courseId: string,
    @Body('userId') userId: string // Extract userId from the request body
  ) {
    return this.dashboardService.getCourseForStudentAnalytics(courseId, userId); // Pass both params to the service
  }
}