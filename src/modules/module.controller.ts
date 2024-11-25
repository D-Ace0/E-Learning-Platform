import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { Module } from 'src/modules/models/module.schema';
import { createModuleDto } from 'src/modules/dto/createModule.dto';
import { updateModuleDto } from 'src/modules/dto/updateModule.dto';
import mongoose from 'mongoose';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';



@Controller('module')
//@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class ModuleController {
  constructor(private moduleService: ModuleService) {}


  //Get all modules
  @Get()
  async getAllModules(): Promise<Module[]> {
    return await this.moduleService.findAll();
  }

  //get module by id
  @Get(':module_id')
  async getModuleById(@Param('module_id') module_id: mongoose.Types.ObjectId) {
    // Get the module ID from the route parameters
    const module = await this.moduleService.findById(module_id);
    return module;
  }

  @Post()
  //@Roles(['instructor'])
  async createModule(@Body() moduleData: createModuleDto) {
    // Get the new module data from the request body
    const newModule = await this.moduleService.create(moduleData);
    return newModule;
  }

  // Update a mocule's details by Id
  @Put(':module_id')
  //@Roles(['instructor'])
  async updateModule(
    @Param('module_id') module_id: mongoose.Types.ObjectId,
    @Body() moduleData: updateModuleDto,
  ) {
    const updatedModule = await this.moduleService.update(module_id, moduleData);
    return updatedModule;
  }

  // Delete a module by id
  @Delete(':module_id')
  //@Roles(['instructor'])
  async deleteModule(@Param('module_id') module_id: mongoose.Types.ObjectId) {
    const deletedModule = await this.moduleService.delete(module_id);
    return deletedModule;
  }
}
