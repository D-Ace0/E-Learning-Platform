import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from 'src/schemas/course.schema';
import { createCourseDto } from 'src/Courses/dto/createCourse.dto';
import { updateCourseDto } from 'src/Courses/dto/updateCourse.dto';
import mongoose from 'mongoose';



@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: mongoose.Model<Course>
  ) {}

  // create a course
  async create(courseData: createCourseDto): Promise<Course> {
    const newCourse = new this.courseModel(courseData); // Use DTO for course creation
    return await newCourse.save(); // Save it to the database
  }

  // Get all courses
  async findAll(): Promise<Course[]> {
    let courses = await this.courseModel.find();  // Fetch all courses from the database
    return courses
  }

  // Get a course by ID
  async findById(course_id: mongoose.Types.ObjectId): Promise<Course> {
    return await this.courseModel.findById(course_id);  // Fetch a course by ID
  }

  
  // Update a course's details by ID
  async update(course_id: mongoose.Types.ObjectId, updateData: updateCourseDto): Promise<Course> {
    return await this.courseModel.findByIdAndUpdate(course_id, updateData, { new: true });  // Find and update the course
  } 

  // Delete a course by ID
  async delete(course_id: mongoose.Types.ObjectId): Promise<Course> {
    return await this.courseModel.findByIdAndDelete(course_id);  // Find and delete the course
  }

  async enrollStudent(){

  }

  // async searchStudent(studentId: string, InstructorId: string){
  //   if(!isValidObjectId(studentId)) throw new BadRequestException()

  //   const coursesCreatedByInstructor = await this.courseModel.find({created_by: InstructorId}).exec()

  //   const studentEnrolled = coursesCreatedByInstructor.some((course) => //some loops over each course in the array of courses
  //     course.enrolled_students.some(
  //       (enrolledStudent) => enrolledStudent.toString() === studentId,
  //     ),
  //   )

  //   if(!studentEnrolled) throw new ForbiddenException('The student you are searching for is not enrolled in any of your courses')
  
  //   const student = await this.userModel.findById(studentId).exec()
  //   const plainStudent = student.toObject();

  //   if(!student) throw new NotFoundException('Student Not Found')

  //   const {password_hash, role, ...StudentData} = plainStudent
  //   return StudentData
  // }

  // async searchInstructor(InstructorId: string){

  //   if(!isValidObjectId(InstructorId)) throw new BadRequestException()

  //   const instructor = await this.userModel.findById(InstructorId).exec()
  //   if(instructor.role.toString() !== "instructor") throw new ForbiddenException()

  //   const plainInstructor = instructor.toObject()
  //   const {password_hash, created_at, role, ...InstructorData} = plainInstructor

  //   return InstructorData
  // }
}
