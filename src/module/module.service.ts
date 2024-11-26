import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Module, ModuleDocument} from 'src/module/models/module.schema'
import { CreateModuleDto } from 'src/module/dto/create.module.dto'
import { UpdateModuleDto } from 'src/module/dto/update.module.dto'
import mongoose from 'mongoose'



@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Module.name) private moduleModel: mongoose.Model<Module>
  ) {}

  // create a module
  async create(moduleData: CreateModuleDto): Promise<ModuleDocument> {
    const newModule = new this.moduleModel(moduleData) // Use DTO for module creation
    return await newModule.save() // Save it to the database
  }

  // Get all modules
  async findAll(): Promise<ModuleDocument[]> {
    let modules = await this.moduleModel.find()  // Fetch all modules from the database
    return modules
  }

  // Get a module by ID
  async findById(module_id: mongoose.Types.ObjectId): Promise<ModuleDocument> {
    return await this.moduleModel.findById(module_id)  // Fetch a module by ID
  }
  
  // Update a module's details by ID
  async update(module_id: mongoose.Types.ObjectId, updateData: UpdateModuleDto): Promise<ModuleDocument> {
    return await this.moduleModel.findByIdAndUpdate(module_id, updateData, { new: true })  // Find and update the module
  } 

  // Delete a module by ID
  async delete(module_id: mongoose.Types.ObjectId): Promise<ModuleDocument> {
    return await this.moduleModel.findByIdAndDelete(module_id)  // Find and delete the module
  }
  
}
