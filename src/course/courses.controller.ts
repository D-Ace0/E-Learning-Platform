import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';
import { CourseService } from './courses.service';
import { Course } from 'src/schemas/course.schema';
import { createCourseDto } from './dto/createCourse.dto';
import { updateCourseDto } from './dto/updateCourse.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import mongoose from 'mongoose';



@Controller('course')
//@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class CourseController {
  constructor(private courseService: CourseService) {}

  //Get all courses
  @Get()
  async getAllCourses(): Promise<Course[]> {
    return await this.courseService.findAll();
  }

  //get course by id
  @Get(':course_id')
  async getCourseById(@Param('course_id') course_id: mongoose.Types.ObjectId) {
    // Get the course ID from the route parameters
    const course = await this.courseService.findById(course_id);
    return course;
  }

  //Create course
  @Post()
  //@Roles(['instructor'])
  async createCourse(@Body() courseData: createCourseDto) {
    // Get the new course data from the request body
    const newCourse = await this.courseService.create(courseData);
    return newCourse;
  }

  // Update a course's details by Id
  @Put(':course_id')
  //@Roles(['instructor'])
  async updateCourse(
    @Param('course_id') course_id: mongoose.Types.ObjectId,
    @Body() courseData: updateCourseDto,
  ) {
    const updatedCourse = await this.courseService.update(course_id, courseData);
    return updatedCourse;
  }

  // Delete a course by id
  @Delete(':course_id')
  //@Roles(['instructor'])
  async deleteCourse(@Param('course_id') course_id: mongoose.Types.ObjectId) {
    const deletedCourse = await this.courseService.delete(course_id);
    return deletedCourse;
  }
}

// @Post('/students/:id')
  // @Roles(['student'])
  // async enroll(@Param('id') courseId: string, @Request() req:any){
  //   const studentId = req.user.UserId
  //   return this.coursesService.studentEnrollCourse(studentId, courseId)
  // }

  // @Get('/students/:id')
  // @Roles(['instructor'])
  // async searchStudent(@Param('id') studentId: string, @Request() req: any){
  //   const InstructorId = req.user.UserId
  //   return this.coursesService.searchStudent(studentId, InstructorId)
  // }

  // @Get('/instructors/:id')
  // @Roles(['student'])
  // async searchInstructor(@Param('id') InstructorId){
  //   return this.coursesService.searchInstructor(InstructorId)
  // }
