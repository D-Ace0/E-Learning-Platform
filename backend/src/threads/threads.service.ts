import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Thread } from 'src/schemas/thread.schema';
import { Model } from 'mongoose';
import { Course } from 'src/schemas/course.schema';
import { Forum } from 'src/schemas/forums.schema';

@Injectable()
export class ThreadsService {

  constructor(@InjectModel(Thread.name) private threadModel: Model<Thread>, @InjectModel(Course.name) private courseModel: Model<Course>,  @InjectModel(Forum.name) private forumModel: Model<Forum>){}

  
  async create(createThreadDto: CreateThreadDto, userId: string, courseId: string, role: string, forumId: string) {
    const forum = await this.forumModel.findById(forumId)
    if(!module) throw new NotFoundException()
    if(role == "instructor" && forum.createdby.toString() !== userId) throw new ForbiddenException()
      
    if (role === "student") {
      const courseId = forum.course_id.toString();
      const course = await this.courseModel.findById(courseId);
      if (!course) throw new NotFoundException('Course not found');
  
      const isEnrolled = course.enrolledStudents.some((s) => s.toString() === userId);
      if (!isEnrolled) throw new ForbiddenException('You are not enrolled in this course');
    }

    const newThread = new this.threadModel({
      instructorId: forum.instructor_id,
      ...createThreadDto,
      EnvolvedUsers_ids: [userId],
      createdBy: userId,
      course_id: courseId
    
    })
    await newThread.save()
    await this.courseModel.findByIdAndUpdate(courseId, {$addToSet: {Thread: newThread._id}})
    await this.forumModel.findByIdAndUpdate(forumId, {$addToSet: {threads: newThread._id}})
    return newThread
  }

  async findAll(userId: string, role: string) {
    // if (role === 'instructor') {
    //   const threads = await this.threadModel
    //     .find({ instructor_id: userId })
    //     .populate('EnvolvedUsers_ids', 'name email');
    //   return threads;
    // }
    // if (role === 'student') {
    //   const threads = await this.threadModel
    //     .find({ EnvolvedUsers_ids: userId })
    //     .populate('EnvolvedUsers_ids', 'name email');
    //     console.log("here" + threads)
    //   return threads;
    // }
    const threads = await this.threadModel.find({})
    return threads
  }
  

  async findOne(threadId: string, userId: string, role: string) {
    const thread = await this.threadModel
      .findById(threadId)
      .populate('EnvolvedUsers_ids', 'name email');
    if (!thread) throw new NotFoundException('Thread not found');
  
    const courseId = thread.course_id;
    const course = await this.courseModel.findById(courseId);
    if (role === 'instructor' && course.created_by.toString() !== userId)
      throw new ForbiddenException();
  
    if (role === 'student') {
      const isEnrolled = course.enrolledStudents.some(
        (s) => s.toString() === userId,
      );
      if (!isEnrolled) throw new ForbiddenException();
    }
  
    return thread;
  }
  

  async update(threadId: string, updateThreadDto: UpdateThreadDto, userId: string, role: string) {
    const thread = await this.threadModel.findById(threadId);
  
    if (!thread) throw new NotFoundException('Thread not found');
  
    if (role === 'instructor') {
      // Allow instructor to update if they are associated with the thread
      if (
        thread.instructor_id.toString() !== userId &&
        thread.createdBy.toString() !== userId
      ) {
        throw new ForbiddenException('You are not authorized to update this thread');
      }
    } else if (role === 'student') {
      // Allow students to update if they are involved in the thread
      const isInvolved = thread.EnvolvedUsers_ids.some(
        (i) => i.toString() === userId
      );
      if (!isInvolved) {
        throw new ForbiddenException('You are not authorized to update this thread');
      }
    } else {
      throw new ForbiddenException('Invalid role');
    }
  
    const updatedThread = await this.threadModel.findByIdAndUpdate(
      threadId,
      updateThreadDto,
      { new: true }
    );
    return updatedThread;
  }
  
  async remove(threadId: string, userId: string, role: string) {
    const thread = await this.threadModel.findById(threadId);
  
    if (!thread) throw new NotFoundException('Thread not found');
  
    if (role === 'instructor') {
      // Allow instructor to delete if they are associated with the thread
      if (
        thread.instructor_id.toString() !== userId &&
        thread.createdBy.toString() !== userId
      ) {
        throw new ForbiddenException('You are not authorized to delete this thread');
      }
    } else if (role === 'student') {
      // Allow students to delete only if they created the thread
      if (thread.createdBy.toString() !== userId) {
        throw new ForbiddenException('You are not authorized to delete this thread');
      }
    } else {
      throw new ForbiddenException('Invalid role');
    }
  
    await this.threadModel.findByIdAndDelete(threadId);
    return { msg: 'Thread has been removed' };
  }
  
}
