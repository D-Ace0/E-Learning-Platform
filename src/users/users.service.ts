import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from 'src/schemas/user.schema';
import { UpdateProfileDto } from './dto/UpdateProfile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getAllStudents(): Promise<User[]> {
    return this.userModel.find({ role: UserRole.STUDENT }).exec();
  }

  async getProfile(userId: string): Promise<User> {
    return this.userModel.findById(userId).exec();
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Only update fields specified in the DTO
    if (updateProfileDto.name) {
      user.name = updateProfileDto.name;
    }
    if (updateProfileDto.email) {
      user.email = updateProfileDto.email;
    }
    if (updateProfileDto.profile_picture_url) {
      user.profile_picture_url = updateProfileDto.profile_picture_url;
    } else {
      throw new ForbiddenException('You are not allowed to update this data');
    }

    // Ensure no other attributes are updated
    const allowedUpdates = ['name', 'email', 'profile_picture_url'];
    Object.keys(updateProfileDto).forEach((key) => {
      if (!allowedUpdates.includes(key)) {
        throw new ForbiddenException(
          `You are not allowed to update the attribute: ${key}`,
        );
      }
    });

    return user.save();
  }

  // delete user
  async deleteUser(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
  async findById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    return user;
  }

}