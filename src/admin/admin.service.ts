import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Admin, AdminDocument } from 'src/admin/models/admin.schema'
import { createAdminDto } from 'src/admin/dto/create.admin.dto'
import { updateAdminDto } from 'src/admin/dto/update.admin.dto'
import mongoose from 'mongoose'

@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin.name) private adminModel: mongoose.Model<Admin>) {}


  // create a admin
  async create(adminData: createAdminDto): Promise<AdminDocument> {
    const newAdmin = new this.adminModel(adminData) // Use DTO for admin creation
    return await newAdmin.save() // Save it to the database
  }

  // Get all admins
  async findAll(): Promise<AdminDocument[]> {
    let admins = await this.adminModel.find()  // Fetch all admins from the database
    return admins
  }

  // Get a admin by ID
  async findById(admin_id: mongoose.Types.ObjectId): Promise<AdminDocument> {
    return await this.adminModel.findById(admin_id)  // Fetch a admin by ID
  }

  // Update a admin's details by ID
  async update(admin_id: mongoose.Types.ObjectId, updateData: updateAdminDto): Promise<AdminDocument> {
    return await this.adminModel.findByIdAndUpdate(admin_id, updateData, { new: true })  // Find and update the admin
  } 

  // Delete a admin by ID
  async delete(admin_id: mongoose.Types.ObjectId): Promise<AdminDocument> {
    return await this.adminModel.findByIdAndDelete(admin_id)  // Find and delete the course
  }
}
