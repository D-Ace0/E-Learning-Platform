import { Controller, Post, Put, Body, Param, UseInterceptors, UploadedFile, UseGuards, Get, Request, Req, } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';




@Controller('courses')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
  ) {}

  
  @Post()
  @Roles(['instructor'])
  async create(@Body() createCourseDto: CreateCourseDto, @Request() req: any) {
    const userId = req.user.UserId
    return this.coursesService.create(createCourseDto, userId);
  }

  
  @Put(':id')
  @Roles(['instructor'])
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @Request() req: any) {
    const userId = req.user.UserId
    return this.coursesService.updateCourse(id, updateCourseDto, userId);
  }

  @Get(':name')
  async searchCourse(@Param('name') courseName: string){
    return this.coursesService.searchCourse(courseName)
  }
}
