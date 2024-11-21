import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from 'src/schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private courseModel: Model<CourseDocument>) {}

  
  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const newCourse = new this.courseModel(createCourseDto);
    return newCourse.save();
  }

  
  async updateCourse(courseId: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    
    
    if (updateCourseDto.title) {
      course.title = updateCourseDto.title;
    }
    if (updateCourseDto.description) {
      course.description = updateCourseDto.description;
    }
    if (updateCourseDto.category) {
      course.category = updateCourseDto.category;
    }

    return course.save();
  }
}
