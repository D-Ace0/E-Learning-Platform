import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Course, CourseDocument } from 'src/course/models/course.schema'
import { CreateCourseDto } from 'src/course/dto/create.course.dto'
import { UpdateCourseDto } from 'src/course/dto/update.course.dto'
import mongoose from 'mongoose'



@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: mongoose.Model<Course>
  ) {}

  // create a course
  async create(courseData: CreateCourseDto): Promise<CourseDocument> {
    const newCourse = new this.courseModel(courseData) // Use DTO for course creation
    return await newCourse.save() // Save it to the database
  }

  // Get all courses
  async findAll(): Promise<CourseDocument[]> {
    let courses = await this.courseModel.find()  // Fetch all courses from the database
    return courses
  }

  // Get a course by ID
  async findById(course_id: mongoose.Types.ObjectId): Promise<CourseDocument> {
    return await this.courseModel.findById(course_id)  // Fetch a course by ID
  }

  
  // Update a course's details by ID
  async update(course_id: mongoose.Types.ObjectId, updateData: UpdateCourseDto): Promise<CourseDocument> {
    return await this.courseModel.findByIdAndUpdate(course_id, updateData, { new: true })  // Find and update the course
  } 

  // Delete a course by ID
  async delete(course_id: mongoose.Types.ObjectId): Promise<CourseDocument> {
    return await this.courseModel.findByIdAndDelete(course_id)  // Find and delete the course
  }
  
}
