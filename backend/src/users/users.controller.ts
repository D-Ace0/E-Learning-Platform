import { Body, Controller, Delete, ForbiddenException, Get, HttpException, HttpStatus, Param, Put, Req, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from 'src/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { ResourceAccessGuard } from 'src/guards/resource-access.guard';

@Controller('users')
@UseGuards(AuthenticationGuard, AuthorizationGuard, ResourceAccessGuard)
export class UsersController {
    constructor(private userService: UsersService){}

    @Get('allUsers')
    @Roles(['admin'])
    async getAllUsers(@Req() {user}){
        console.log(user)
        return this.userService.getAllUsers()
    }
    @Roles(['admin'])
    @Get('allStudents')
    async getAllStudents(){
        return this.userService.getAllStudents()
    }

    @Roles(['admin'])
    @Get ('/allInstructors')
    async getAllInstructors(){
        return this.userService.getAllInstructors()
    }

    @Roles(['admin', 'instructor', 'student'])
    @Get(':id')
    async findMyProfile(@Param('id') id: string) {
        const user = await this.userService.getProfile(id);
        if (!user) {
            throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
        }
        return user;
    }

    @Roles(['admin', 'instructor', 'student'])
    @Put('editProfile/:id')
    async updateProfile(@Param('id') id: string, @Body() updateUserDto: Partial<User>,  @Request() req: any): Promise<User> {
        if(req.user.role === 'admin' && id !== req.user.user_id ){
            throw new ForbiddenException("You can't update another admin ")
        }

        const update = await this.userService.updateProfile(id, updateUserDto);
        if (!update) {
            throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
        }
        return update;
    }

    @Roles(['admin', 'instructor', 'student'])
    @Delete('delete/:id')
    async deleteUser(@Param('id') id: string,  @Request() req: any):  Promise<{ message: string }>  {
        if(req.user.role === 'admin' && id !== req.user.user_id ){
            throw new ForbiddenException("You can't delete another admin ")
        }
        return this.userService.deleteUser(id)
    }

    


}