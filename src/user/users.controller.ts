import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { UsersService } from './users.service';
  import { User } from 'src/user/models/user.schema';
  import { createUserDto } from './dto/createUser.dto';
  import { updateUserDto } from './dto/updateUser.dto';
  import { Roles } from 'src/decorators/roles.decorator';
  import { AuthenticationGuard } from 'src/guards/authentication.guard';
  import { AuthorizationGuard } from 'src/guards/authorization.guard';
  import mongoose from 'mongoose';

@Controller('user')
// @Roles(['admin'])
//@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class UsersController {
    constructor(private userService: UsersService){}

    // Get All Users
    @Get()
    // @Roles(UserRole.ADMIN)
    @Get('allUsers')
    async getAllUsers(): Promise<User[]> {
        return await this.userService.findAll();
    }

    // Get All Students
    @Get('allStudents')
    async getAllStudents(){
        return this.userService.getAllStudents()
    }

    // Get All Instructors
    @Get('allInstructors')
    async getAllInstructors(){
        return this.userService.getAllInstructors()
    }


    //Get user by id
    @Get(':user_id')
    async getUserById(@Param('user_id') user_id: mongoose.Types.ObjectId) {
        // Get the user ID from the route parameters
        const user = await this.userService.findById(user_id);
        return user;
    }

    //Create user
    @Post()
    // @Roles(UserRole.ADMIN)
    async createUser(@Body() userData: createUserDto) {
        // Get the new user data from the request body
        const newUser = await this.userService.create(userData);
        return newUser;
    }
    
    // Update a user's details by Id
    @Put(':user_id')
    // @Roles(UserRole.ADMIN)
    async updateUser(
        @Param('user_id') user_id: mongoose.Types.ObjectId,
        @Body() userData: updateUserDto,
    ) {
        const updatedUser = await this.userService.update(user_id, userData);
        return updatedUser;
    }

    //@UseGuards(JwtService)
    // Delete a course by id
    @Delete(':user_id')
    // @Roles(UserRole.ADMIN)
    async deleteUser(@Param('user_id') user_id: mongoose.Types.ObjectId) {
        const deletedUser = await this.userService.delete(user_id);
        return deletedUser;
    }
}
