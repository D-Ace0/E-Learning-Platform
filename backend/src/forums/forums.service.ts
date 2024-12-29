import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Forum } from 'src/schemas/forums.schema';
import { Model, Types } from 'mongoose';
import { Course } from 'src/schemas/course.schema';

@Injectable()
export class ForumsService {

  constructor(@InjectModel(Forum.name) private forumsModel: Model<Forum>, @InjectModel(Course.name) private courseModel: Model<Course>){}

  async create(createForumDto: CreateForumDto, userId: string, courseId: string, role: string) {
    const course = await this.courseModel.findById(courseId)
    if(!course) throw new NotFoundException("Course not found")
    const IsCreatedByInstructor = course.created_by
    if(role == 'instructor' && IsCreatedByInstructor.toString() !== userId) throw new ForbiddenException()

    const newForum = new this.forumsModel({
      ...createForumDto,
      instructor_id: IsCreatedByInstructor,
      course_id: courseId,
      createdby: userId
    })
    return await newForum.save()
  }

  async findAll(userId: string, role: string, courseId: string) {
    if (role === "instructor") {
      // Fetch forums for the course created by the instructor
      const forums = await this.forumsModel.find({ course_id: courseId });
      return forums;
    }
  
    if (role === "student") {
      // Check if the student is enrolled in the course
      const course = await this.courseModel.findById(courseId);
      console.log(courseId)
      if (!course) throw new NotFoundException("Course not found");
  
      const isEnrolled = course.enrolledStudents.some((s) => s.toString() === userId);
      if (!isEnrolled) throw new ForbiddenException("You are not enrolled in this course");
  
      // Fetch forums for the course
      return await this.forumsModel.find({ course_id: courseId });
    }
  
    throw new ForbiddenException("Invalid role");
  }
  
  

  async findOne(id: string, userId: string, role: string) {
    const forum = await this.forumsModel.findById(id);
    if (!forum) throw new NotFoundException('Forum not found');
  
    if (role === "instructor") {
      if (forum.instructor_id.toString() !== userId) throw new ForbiddenException();
      return forum;
    }
  
    const createdbY = forum.createdby
    if(role === "student" && createdbY.toString() === userId) return forum

    if (role === "student") {
      const courseId = forum.course_id.toString();
      const course = await this.courseModel.findById(courseId);
      if (!course) throw new NotFoundException('Course not found');
  
      const isEnrolled = course.enrolledStudents.some((s) => s.toString() === userId);
      if (isEnrolled) return forum;
      throw new ForbiddenException('You are not enrolled in this course');
    }
  
    throw new ForbiddenException('Invalid role');
  }
  

  async update(id: string, updateForumDto: UpdateForumDto, userId: string) {
    const forum = await this.forumsModel.findById(id);
    if (!forum) throw new NotFoundException('Forum not found');
    if (forum.createdby.toString() !== userId) throw new ForbiddenException('You are not authorized to update this forum');
    return await this.forumsModel.findByIdAndUpdate(id, updateForumDto, { new: true });
  }
  
  async remove(id: string, userId: string, role: string) {
    const forum = await this.forumsModel.findById(id);
    if (!forum) throw new NotFoundException('Forum not found');

    if(role === "student"){
      if(forum.createdby.toString() !== userId) throw new ForbiddenException('You are not authorized to delete this forum')
      await this.forumsModel.findByIdAndDelete(id)
    }

    if(role === "instructor"){
      if(forum.instructor_id.toString() !== userId) throw new ForbiddenException('You are not authorized to delete this forum')
      
      await this.forumsModel.findByIdAndDelete(id)
    }

    return {msg: "Forum Removed"}
  }
  
}
