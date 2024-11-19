import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { UpdateProfileDto } from './dto/UpdateProfile.dto';

@Injectable()
export class UsersService {
    constructor (
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ){}

    async getProfile(userId: string): Promise<User> {
        return this.userModel.findById(userId).exec()
    }

    async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<User> { 
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
        }
        if (updateProfileDto.user_id) {
            const found = await this.userModel.findOne({ user_id: updateProfileDto.user_id });
            if (found) {
                throw new ConflictException(`User with ID ${updateProfileDto.user_id} already used`);
            }
            user.user_id = updateProfileDto.user_id;
        } else {
            throw new ForbiddenException('You are not allowed to update this data');
        }

        // Ensure no other attributes are updated
        const allowedUpdates = ['user_id', 'name', 'email', 'profile_picture_url'];
        Object.keys(updateProfileDto).forEach(key => {
            if (!allowedUpdates.includes(key)) {
                throw new ForbiddenException(`You are not allowed to update the attribute: ${key}`);
            }
        });

        return user.save();
    }



}
