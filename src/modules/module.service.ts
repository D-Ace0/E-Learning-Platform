import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Module, ModuleDocument } from '../schemas/module.schema';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>, // Injects the Module model
  ) {}

  // creates
  async create(createModuleDto: Partial<Module>): Promise<Module> {
    const createdModule = new this.moduleModel(createModuleDto);
    return createdModule.save();
  }

  //  finds
  async findAll(): Promise<Module[]> {
    return this.moduleModel.find().exec();
  }

  // finds one
  async findOne(id: string): Promise<Module> {
    const module = await this.moduleModel.findById(id).exec();
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module;
  }

  // updates
  async update(id: string, updateModuleDto: Partial<Module>): Promise<Module> {
    const updatedModule = await this.moduleModel
      .findByIdAndUpdate(id, updateModuleDto, { new: true })
      .exec();
    if (!updatedModule) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return updatedModule;
  }

  // Deletes
  async delete(id: string): Promise<void> {
    const result = await this.moduleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
  }
}
