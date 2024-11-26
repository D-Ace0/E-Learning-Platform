import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { ModuleService } from './module.service'
import { Module } from 'src/module/models/module.schema'
import { CreateModuleDto } from 'src/module/dto/create.module.dto'
import { UpdateModuleDto } from 'src/module/dto/update.module.dto'
import mongoose from 'mongoose'



@Controller('module')
export class ModuleController {
  constructor(private moduleService: ModuleService) {}

  //Get all modules
  @Get()
  async getAllModules(): Promise<Module[]> {
    return await this.moduleService.findAll()
  }

  //get module by id
  @Get(':module_id')
  async getModuleById(@Param('module_id') module_id: mongoose.Types.ObjectId):Promise<Module> {
    // Get the module ID from the route parameters
    const module = await this.moduleService.findById(module_id)
    return module
  }

  //Create module
  @Post()
  async createModule(@Body() moduleData: CreateModuleDto) {
    // Get the new module data from the request body
    const newModule = await this.moduleService.create(moduleData)
    return newModule
  }

  // Update a module's details by Id
  @Put(':module_id')
  async updateModule(
    @Param('module_id') module_id: mongoose.Types.ObjectId,
    @Body() moduleData: UpdateModuleDto) {
    const updatedModule = await this.moduleService.update(module_id, moduleData)
    return updatedModule
  }

  // Delete a module by id
  @Delete(':module_id')
  async deleteModule(@Param('module_id') module_id: mongoose.Types.ObjectId) {
    const deletedModule = await this.moduleService.delete(module_id)
    return deletedModule
  }
}
