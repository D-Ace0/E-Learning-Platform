import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from 'src/schemas/user.schema';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { RolesGuard } from 'src/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtService, RolesGuard)
export class UsersController {
    constructor(private userService: UsersService){}

    @Get('allUsers')
    @Roles(UserRole.ADMIN)
    async getAllUsers(){
        return this.userService.getAllUsers()
    }

    @Get('allStudents')
    @Roles(UserRole.INSTRUCTOR)
    async getAllStudents(){
        return this.userService.getAllStudents()
    }


    @Get(':id')
    async findMyProfile(@Param ('id') id: string ){
        try {
            const user = await this.userService.getProfile(id);
            if(!user){
                throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
            }
            return user;
        } catch (error) {
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Put('editProfile/:id')
    async updateProfile(@Param('id') id: string, @Body() updateUserDto: Partial<User>): Promise<User> {
        try {
            const update = await(this.userService.updateProfile(id, updateUserDto))
            if (!update) {
                throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
            }
            return update
        } catch (error) {
             throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        } 
    }

    @UseGuards(JwtService, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async deleteUser(@Param('id') id: string): Promise<User> {
        return this.userService.deleteUser(id)
    }

    


}
