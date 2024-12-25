import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from 'src/schemas/post.schema';
import { Model } from 'mongoose';
import { Course } from 'src/schemas/course.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    threadId: string,
    courseId: string,
    role: string,
    userId: string,
  ) {
    const course = await this.courseModel.findById(courseId);

    if (role === 'instructor' && course.created_by.toString() !== userId) {
      throw new ForbiddenException("You can't post in other courses");
    }

    if (role === 'student') {
      const isStudentEnrolled = course.enrolledStudents.map(
        (student) => student.toString() === userId,
      );
      if (!isStudentEnrolled) {
        throw new ForbiddenException("You can't post in courses you aren't enrolled in");
      }
    }

    console.log(threadId)
    const newPost = new this.postModel({
      thread_id: threadId,
      user_id: userId,
      ...createPostDto,
    });
    
    return await newPost.save();
  }

  async findAll(courseId: string, threadId: string, role: string, userId: string) {
    const course = await this.courseModel.findById(courseId);
  
    // Authorization for instructors
    if (role === 'instructor' && course.created_by.toString() !== userId) {
      throw new ForbiddenException("You can't view posts in other courses");
    }
  
    // Authorization for students
    if (role === 'student') {
      const isStudentEnrolled = course.enrolledStudents.some(
        (student) => student.toString() === userId,
      );
      if (!isStudentEnrolled) {
        throw new ForbiddenException("You can't view posts in courses you aren't enrolled in");
      }
    }
  
    return await this.postModel
      .find({ thread_id: threadId }) // Match the field name here
      .populate('user_id', 'name email') // Populate user details
      .populate('thread_id') 
      .exec();
  }
  

  async findOne(postId: string, courseId: string, role: string, userId: string) {
    const post = await this.postModel.findById(postId).populate('user_id');
  
    if (!post) {
      throw new ForbiddenException('Post not found');
    }
  
    const course = await this.courseModel.findById(courseId);
  
    if (role === 'instructor' && course.created_by.toString() !== userId) {
      throw new ForbiddenException("You can't view posts in other courses");
    }
  
    if (role === 'student') {
      const isStudentEnrolled = course.enrolledStudents.map(
        (student) => student.toString() === userId,
      );
      if (!isStudentEnrolled) {
        throw new ForbiddenException("You can't view posts in courses you aren't enrolled in");
      }
    }
  
    return post;
  }
  
  async update(postId: string, updatePostDto: UpdatePostDto, userId: string, role: string) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new ForbiddenException('Post not found');
    }

    if (post.user_id.toString() !== userId) {
      throw new ForbiddenException("You can't edit posts that you didn't create");
    }

    Object.assign(post, updatePostDto);

    return await post.save();
  }

  async remove(postId: string, userId: string, role: string) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new ForbiddenException('Post not found');
    }

    if (post.user_id.toString() !== userId && role !== 'instructor') {
      throw new ForbiddenException("You can't delete posts that you didn't create");
    }

    return await this.postModel.findByIdAndDelete(postId);
  }
}
