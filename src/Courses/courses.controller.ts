import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Request,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/createCourse.dto';
import { UpdateCourseDto } from './dto/updateCourse.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import mongoose from 'mongoose';




@Controller('courses')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
  ) {}

  
  @Post()
  @Roles(['instructor'])
  async create(@Body() createCourseDto: CreateCourseDto, @Request() req: any) {
    const userId = req.user.user_id
    return this.coursesService.create(createCourseDto, userId);
  }

  
  @Put(':id')
  @Roles(['instructor'])
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @Request() req: any) {
    const userId = req.user.user_id
    return this.coursesService.updateCourse(id, updateCourseDto, userId);
  }

  @Get(':name')
  @Roles(['student', 'instructor', 'admin']) //Users can search for a certain course.
  async searchCourse(@Param('name') courseName: string){
    return this.coursesService.searchCourse(courseName)
  }

  
  @Post('/students/:id')
  @Roles(['student'])
  async enroll(@Param('id') courseId: string, @Request() req:any){
    const studentId = req.user.user_id
    return this.coursesService.studentEnrollCourse(studentId, courseId)
  }

  @Get('/students/:id')
  @Roles(['instructor'])
  async searchStudent(@Param('id') studentId: string, @Request() req: any){
    const InstructorId = req.user.user_id
    return this.coursesService.searchStudent(studentId, InstructorId)
  }

  @Get('/instructors/:id')
  @Roles(['student'])
  async searchInstructor(@Param('id') InstructorId){
    return this.coursesService.searchInstructor(InstructorId)
  }








}
