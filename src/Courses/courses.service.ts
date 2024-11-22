import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { Course } from 'src/schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { v4 as uuidv4 } from 'uuid';
import { isValidObjectId, Types } from 'mongoose';
import { User } from 'src/schemas/user.schema';


@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>, @InjectModel(User.name) private userModel: Model<User>) {}

  
  async create(createCourseDto: CreateCourseDto, userid: string) {
    const newCourse = new this.courseModel({
      ...createCourseDto,
      created_by: userid
    });
    if(await this.courseModel.findOne({course_id: newCourse.course_id})) throw new BadRequestException("Course with this ID already exists!")

    return newCourse.save();
  }

  
  async updateCourse(id: string, updateCourseDto: UpdateCourseDto, userid: string){

    if(!isValidObjectId(id)) throw new BadRequestException('Invalid course ID');


    const course = await this.courseModel.findById(id).exec()
    if(!course) throw new NotFoundException("Course Does not exist")
    
    const userIdObjectId = new Types.ObjectId(userid);

    if (course.created_by.toString() !== userIdObjectId.toString()) throw new ForbiddenException('You cannot update this course');
    
    const newCourseId = `${course.course_id}_${uuidv4()}`;

    const {_id, ...oldContentOfCourseWithoutObjectId} = course

    const newCourse = new this.courseModel({
      oldContentOfCourseWithoutObjectId,
      ...updateCourseDto,
      course_id: newCourseId,
      parentVersion: course.course_id,
      created_at: new Date(),
      created_by: userid
    })
    
    return newCourse.save()
  }


  async searchCourse(courseName: string){
    const course = await this.courseModel.findOne({title: courseName})
    if(!course) throw new NotFoundException('Course not found')
    return course
  }



  async studentEnrollCourse(studentId: string, courseId: string){
    const course = await this.courseModel.findById(courseId)
    if(!course) throw new NotFoundException('Course not found')
      
    const studentId_ObjectId = new Types.ObjectId(studentId)

    const EnrolledStudentsIds = course.enrolledStudents

    if(EnrolledStudentsIds.includes(studentId_ObjectId as any)) throw new BadRequestException('You are already enrolled in this course')

    course.enrolledStudents.push(studentId_ObjectId as any)

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
    const {password_hash, created_at, role, ...InstructorData} = plainInstructor

    return InstructorData
  }
}
