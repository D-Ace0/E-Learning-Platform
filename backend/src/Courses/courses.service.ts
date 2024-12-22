import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';

import { CreateCourseDto } from './dto/createCourse.dto';
import { UpdateCourseDto } from './dto/updateCourse.dto';
import { v4 as uuidv4 } from 'uuid';
import { isValidObjectId, Types } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { Course } from 'src/schemas/course.schema';


@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>, @InjectModel(User.name) private userModel: Model<User>) {}


  async create(createCourseDto: CreateCourseDto, userid: string) {
    const newCourse = new this.courseModel({
        ...createCourseDto,
        created_by: userid
    });

    if (await this.courseModel.findOne({ title: newCourse.title })) {
        throw new BadRequestException("Course with this title already exists!");
    }

    const user = await this.userModel.findById(userid);
    if (!user) {
        throw new NotFoundException("User not found");
    }

    // Add the new course to the user's courses array
    user.courses.push(newCourse);

    // Save the user document
    await user.save();

    // Save the new course
    return newCourse.save();
}


  async updateCourse(id: string, updateCourseDto: UpdateCourseDto, instructor_id: string){

    if(!isValidObjectId(id)) throw new BadRequestException('Invalid course ID');

    const course = await this.courseModel.findById(id).exec()
    if(!course) throw new NotFoundException("Course Does not exist")

    const instructor_id_AS_ObjectId = new Types.ObjectId(instructor_id);
    if (course.created_by.toString() !== instructor_id_AS_ObjectId.toString()) throw new ForbiddenException('You cannot update this course');

    return await this.courseModel.findByIdAndUpdate(id, updateCourseDto, {new: true}).exec()
  }

  async deleteCourse(id: string, instructor_id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid course ID');

    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course does not exist');

    const instructor_id_AS_ObjectId = new Types.ObjectId(instructor_id);
    if (course.created_by.toString() !== instructor_id_AS_ObjectId.toString()) throw new ForbiddenException('You cannot delete this course');

    await this.courseModel.findByIdAndDelete(id).exec();
    return { message: 'Course deleted successfully' };
  }


  async searchCourse(courseName: string){
    const course = await this.courseModel.findOne({title: courseName})
    if(!course) throw new NotFoundException('Course not found')
    return course
  }



  async studentEnrollCourse(studentId: string, courseId: string){
    const course = await this.courseModel.findById(courseId)
    if(!course) throw new NotFoundException('Course not found')


    // add the student to enrolledStudents in course document
    const studentId_ObjectId = new Types.ObjectId(studentId)
    const EnrolledStudentsIds = course.enrolledStudents
    if(EnrolledStudentsIds.includes(studentId_ObjectId as any)) throw new BadRequestException('You are already enrolled in this course')
    course.enrolledStudents.push(studentId_ObjectId as any)

    // add the course to the courses array of the user document
    const user = await this.userModel.findById(studentId).exec()
    const courseId_ObjectId = new Types.ObjectId(courseId)
    user.courses.push(courseId_ObjectId as any)
    await user.save()

    return await course.save()
  }

  async searchStudent(studentId: string, InstructorId: string){
    if(!isValidObjectId(studentId)) throw new BadRequestException()

    const coursesCreatedByInstructor = await this.courseModel.find({created_by: InstructorId}).exec()

    const studentEnrolled = coursesCreatedByInstructor.some((course) => //some loops over each course in the array of courses
      course.enrolledStudents.some(
        (enrolledStudent) => enrolledStudent.toString() === studentId,
      ),
    )

    if(!studentEnrolled) throw new ForbiddenException('The student you are searching for is not enrolled in any of your courses')

    const student = await this.userModel.findById(studentId).exec()
    const plainStudent = student.toObject();

    if(!student) throw new NotFoundException('Student Not Found')

    const {password_hash, role, ...StudentData} = plainStudent
    return StudentData
  }

  async searchInstructor(InstructorId: string){

    if(!isValidObjectId(InstructorId)) throw new BadRequestException()

    const instructor = await this.userModel.findById(InstructorId).exec()
    if(instructor.role.toString() !== "instructor") throw new ForbiddenException()

    const plainInstructor = instructor.toObject()
    const {password_hash, created_at, role, mfa_enabled, ...InstructorData} = plainInstructor

    return InstructorData
  }


  async findById(courseId: string): Promise<Course | null> {
    return this.courseModel.findById(courseId).exec(); // Ensures Mongoose methods are available
  }






// .select('-Attribute you wanna hide')
async getAll(){
  const courses = await this.courseModel.find({}).exec()
  return courses
}







}