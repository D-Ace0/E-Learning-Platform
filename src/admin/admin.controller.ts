import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
  } from '@nestjs/common'
  import { AdminService } from 'src/admin/admin.service'
  import { Admin } from 'src/admin/models/admin.schema'
  import { createAdminDto } from 'src/admin/dto/create.admin.dto'
  import { updateAdminDto } from 'src/admin/dto/update.admin.dto'
  import mongoose from 'mongoose'

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService){}

    // Get All Admins
    @Get()
    async getAllAdmins(): Promise<Admin[]> {
        return await this.adminService.findAll()
    }

    //Get admin by id
    @Get(':admin_id')
    async getAdminById(@Param('admin_id') admin_id: mongoose.Types.ObjectId) {
        // Get the admin ID from the route parameters
        const admin = await this.adminService.findById(admin_id)
        return admin
    }

    //Create admin
    @Post()
    async createAdmin(@Body() adminData: createAdminDto) {
        // Get the new admin data from the request body
        const newAdmin = await this.adminService.create(adminData)
        return newAdmin
    }
    
    // Update a admin's details by Id
    @Put(':admin_id')
    async updateAdmin(
        @Param('admin_id') admin_id: mongoose.Types.ObjectId,
        @Body() adminData: updateAdminDto,
    ) {
        const updatedAdmin = await this.adminService.update(admin_id, adminData)
        return updatedAdmin
    }

    // Delete a course by id
    @Delete(':admin_id')
    async deleteAdmin(@Param('admin_id') admin_id: mongoose.Types.ObjectId) {
        const deletedAdmin = await this.adminService.delete(admin_id)
        return deletedAdmin
    }
}
