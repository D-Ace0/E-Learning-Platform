import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from 'src/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';

@Controller('users')
// @Roles(['admin'])
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class UsersController {
    constructor(private userService: UsersService){}

    @Get('allUsers')
    @Roles(['admin', 'instructor'])
    async getAllUsers(@Req() {user}){
        console.log(user)
        return this.userService.getAllUsers()
    }

    @Get('allStudents')
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

    @UseGuards(JwtService)
    // @Roles(UserRole.ADMIN)
    @Delete(':id')
    async deleteUser(@Param('id') id: string): Promise<User> {
        return this.userService.deleteUser(id)
    }

    


}
