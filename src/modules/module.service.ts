import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';;
import { Module} from 'src/schemas/module.schema';
import { createModuleDto } from 'src/modules/dto/createModule.dto';
import { updateModuleDto } from 'src/modules/dto/updateModule.dto';
import mongoose from 'mongoose';



@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Module.name) private moduleModel: mongoose.Model<Module>, // Injects the Module model
  ) {}

  // creates
  async create(moduleData: createModuleDto): Promise<Module> {
    const newModule = new this.moduleModel(moduleData);
    return await newModule.save()
  }

  //  finds
  async findAll(): Promise<Module[]> {
    let modules = await this.moduleModel.find();
    return modules
  }

  // finds one
  async findById(module_id: mongoose.Types.ObjectId): Promise<Module> {
    return await this.moduleModel.findById(module_id);
    // const module = await this.moduleModel.findById(module_id).exec();
    // if (!module) {
    //   throw new NotFoundException(`Module with ID ${module_id} not found`)
    // }
    // return module
  }

  // updates
  async update(module_id: mongoose.Types.ObjectId, updateData: updateModuleDto): Promise<Module> {
    return await this.moduleModel.findByIdAndUpdate(module_id, updateData, { new: true });
    //   .findByIdAndUpdate(module_id, updateModuleDto, { new: true })
    //   .exec();
    // if (!updatedModule) {
    //   throw new NotFoundException(`Module with ID ${module_id} not found`);
    // }
    // return updatedModule;
  }

  // Deletes
  async delete(module_id: mongoose.Types.ObjectId): Promise<Module> {
    return await this.moduleModel.findByIdAndDelete(module_id);
    // const result = await this.moduleModel.findByIdAndDelete(module_id).exec();
    // if (!result) {
    //   throw new NotFoundException(`Module with ID ${module_id} not found`)
    // }
  }
}
