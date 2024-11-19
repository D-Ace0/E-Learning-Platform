import { Body, Controller, Get, HttpException, HttpStatus, Param, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/schemas/user.schema';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService){}

    @Get(':id')
    async findProfile(@Param ('id') id: string ){
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
            const update = this.userService.updateProfile(id, updateUserDto)
            if (!update) {
                throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
            }
            return update
        } catch (error) {
             throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        } 
    }

    


}
