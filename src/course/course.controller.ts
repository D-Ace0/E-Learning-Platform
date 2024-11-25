import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { CourseService } from './course.service'
import { Course } from 'src/course/models/course.schema'
import { CreateCourseDto } from './dto/create.course.dto'
import { UpdateCourseDto } from './dto/update.course.dto'
import mongoose from 'mongoose'



@Controller('course')
export class CourseController {
  constructor(private courseService: CourseService) {}

  //Get all courses
  @Get()
  async getAllCourses(): Promise<Course[]> {
    return await this.courseService.findAll()
  }

  //get course by id
  @Get(':course_id')
  async getCourseById(@Param('course_id') course_id: mongoose.Types.ObjectId) {
    // Get the course ID from the route parameters
    const course = await this.courseService.findById(course_id)
    return course
  }

  //Create course
  @Post()
  async createCourse(@Body() courseData: CreateCourseDto) {
    // Get the new course data from the request body
    const newCourse = await this.courseService.create(courseData)
    return newCourse
  }

  // Update a course's details by Id
  @Put(':course_id')
  async updateCourse(
    @Param('course_id') course_id: mongoose.Types.ObjectId,
    @Body() courseData: UpdateCourseDto,
  ) {
    const updatedCourse = await this.courseService.update(course_id, courseData)
    return updatedCourse
  }

  // Delete a course by id
  @Delete(':course_id')
  async deleteCourse(@Param('course_id') course_id: mongoose.Types.ObjectId) {
    const deletedCourse = await this.courseService.delete(course_id)
    return deletedCourse
  }
}
