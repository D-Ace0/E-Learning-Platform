import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User } from 'src/user/models/user.schema'
import { createUserDto } from './dto/create.user.dto'
import { updateUserDto } from './dto/update.user.dto'
import mongoose from 'mongoose'

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: mongoose.Model<User>) {}


  // create a user
  async create(userData: createUserDto): Promise<User> {
    const newUser = new this.userModel(userData) // Use DTO for user creation
    return await newUser.save() // Save it to the database
  }

  // Get all users
  async findAll(): Promise<User[]> {
    let users = await this.userModel.find()  // Fetch all users from the database
    return users
  }

  // Get a user by ID
  async findById(user_id: mongoose.Types.ObjectId): Promise<User> {
    return await this.userModel.findById(user_id)  // Fetch a user by ID
  }

  // Update a user's details by ID
  async update(user_id: mongoose.Types.ObjectId, updateData: updateUserDto): Promise<User> {
    return await this.userModel.findByIdAndUpdate(user_id, updateData, { new: true })  // Find and update the user
  } 

  // Delete a user by ID
  async delete(user_id: mongoose.Types.ObjectId): Promise<User> {
    return await this.userModel.findByIdAndDelete(user_id)  // Find and delete the course
  }
}
