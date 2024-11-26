import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
  } from '@nestjs/common'
  import { UserService } from './user.service'
  import { User } from 'src/user/models/user.schema'
  import { createUserDto } from './dto/create.user.dto'
  import { updateUserDto } from './dto/update.user.dto'
  import mongoose from 'mongoose'

@Controller('user')
export class UserController {
    constructor(private userService: UserService){}

    // Get All Users
    @Get()
    async getAllUsers(): Promise<User[]> {
        return await this.userService.findAll()
    }

    //Get user by id
    @Get(':user_id')
    async getUserById(@Param('user_id') user_id: mongoose.Types.ObjectId) {
        // Get the user ID from the route parameters
        const user = await this.userService.findById(user_id)
        return user
    }

    //Create user
    @Post()
    async createUser(@Body() userData: createUserDto) {
        // Get the new user data from the request body
        const newUser = await this.userService.create(userData)
        return newUser
    }
    
    // Update a user's details by Id
    @Put(':user_id')
    async updateUser(
        @Param('user_id') user_id: mongoose.Types.ObjectId,
        @Body() userData: updateUserDto,
    ) {
        const updatedUser = await this.userService.update(user_id, userData)
        return updatedUser
    }

    // Delete a course by id
    @Delete(':user_id')
    async deleteUser(@Param('user_id') user_id: mongoose.Types.ObjectId) {
        const deletedUser = await this.userService.delete(user_id)
        return deletedUser
    }
}
