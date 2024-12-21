import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdateProfileDto } from './dto/UpdateProfile.dto';
import { User, UserDocument, UserRole } from 'src/schemas/user.schema';
import { Course } from 'src/schemas/course.schema';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
                @InjectModel(Course.name) private courseModel: Model<Course>) {}

  async getCourses(studentId: string) {
    const coursesObjectIds = (await this.userModel.findById(studentId)).courses
    const couseTitles = (await this.courseModel.find({_id: coursesObjectIds}))
    return couseTitles.map(c => ({
      _id: c._id,
      title: c.title,
      description: c.description
    }))
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to get all users');
    }
  }

  async getAllStudents(): Promise<User[]> {
    try {
      return await this.userModel.find({ role: UserRole.STUDENT }).select('-password_hash').exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to get all students');
    }
  }

  async getAllInstructors(): Promise<User[]> {
    try {
      return await this.userModel.find({ role: UserRole.INSTRUCTOR }).select('-password_hash').exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to get all students');
    }
  }

  async getProfile(userId: string): Promise<User> {
    try {
      const user = await this.userModel.findById(userId).select('-password_hash').exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get user profile');
    }
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(id, updateProfileDto, { new: true }).exec();
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user profile');
    }
  }

  // delete user
  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { message: 'Profile deleted successfully' };
  }
  async findById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    return user;
  }

}