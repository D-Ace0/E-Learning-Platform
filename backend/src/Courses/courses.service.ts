import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';

import { CreateCourseDto } from './dto/createCourse.dto';
import { UpdateCourseDto } from './dto/updateCourse.dto';
import { v4 as uuidv4 } from 'uuid';
import { isValidObjectId, Types } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { Course } from 'src/schemas/course.schema';
import { UserInteraction } from 'src/schemas/user_interaction';
import { Progress } from 'src/schemas/progress.schema';


@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>,
              @InjectModel(User.name) private userModel: Model<User>,
              @InjectModel(UserInteraction.name) private userInteractionModel: Model<UserInteraction>,
              @InjectModel(Progress.name) private progressModel: Model<Progress>)
  {}


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


  async updateCourse(id: string, updateCourseDto: UpdateCourseDto, userId: string): Promise<Course> {
    const course = await this.courseModel.findById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    if (course.created_by.toString() !== userId) {
      throw new UnauthorizedException('You are not authorized to update this course');
    }
    try {
      const { isOutdated, ...rest } = updateCourseDto;
      // Set created_by and created_at to today's date
      const updatedCourse = await this.courseModel.findByIdAndUpdate(
          id,
          {
            ...rest,
            created_by: userId, // Update created_by to the current user
            created_at: new Date().toISOString() // Update created_at to today's date
          },
          { new: true }
      );
      if (!updatedCourse) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
      return updatedCourse;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
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



  async studentEnrollCourse(studentId: string, courseId: string) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    // Add the student to the enrolledStudents in course document
    const studentId_ObjectId = new Types.ObjectId(studentId);
    if (course.enrolledStudents.includes(studentId_ObjectId as any)) {
      throw new BadRequestException('You are already enrolled in this course');
    }
    course.enrolledStudents.push(studentId_ObjectId as any);

    // Add the course to the student's courses
    const user = await this.userModel.findById(studentId).exec();
    const courseId_ObjectId = new Types.ObjectId(courseId);
    user.courses.push(courseId_ObjectId as any);
    await user.save();

    // Create a UserInteraction record without response_id initially
    const interaction = new this.userInteractionModel({
      user_id: studentId_ObjectId,
      course_id: courseId_ObjectId,
      time_spent_minutes: 0, // Default
      last_accessed: new Date(),
    });
    await interaction.save();

    // Initialize progress with 0 for the course
    const progress = new this.progressModel({
      user_id: studentId_ObjectId,
      course_id: courseId_ObjectId,
      completionPercentage: 0,
      lastAccessed: new Date()
    });
    await progress.save();

    return await course.save();
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