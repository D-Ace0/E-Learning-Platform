import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Module} from 'src/module/models/module.schema'
import { CreateModuleDto } from 'src/module/dto/create.module.dto'
import { UpdateModuleDto } from 'src/module/dto/update.module.dto'
import mongoose from 'mongoose'



@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Module.name) private moduleModel: mongoose.Model<Module>, // Injects the Module model
  ) {}

  // create a module
  async create(moduleData: CreateModuleDto): Promise<Module> {
    const newModule = new this.moduleModel(moduleData)
    return newModule.save()
  }

  // Get all modules
  async findAll(): Promise<Module[]> {
    let modules = await this.moduleModel.find()
    return modules
  }

  // Get a module by ID
  async findById(module_id: mongoose.Types.ObjectId): Promise<Module> {
    return await this.moduleModel.findById(module_id)
  }

  // Update a module's details by ID
  async update(module_id: mongoose.Types.ObjectId, updateData: UpdateModuleDto): Promise<Module> {
    return await this.moduleModel.findByIdAndUpdate(module_id, updateData, { new: true })
  }

  // Delete a module by ID
  async delete(module_id: mongoose.Types.ObjectId): Promise<Module> {
    return await this.moduleModel.findByIdAndDelete(module_id)
  }
  
}
