import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { Module } from '../schemas/module.schema';
import { createModuleDto } from 'src/modules/dto/createModule.dto';
import { updateModuleDto } from 'src/modules/dto/updateModule.dto';
import mongoose, { isValidObjectId } from 'mongoose';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';



@Controller('module')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class ModuleController {
  constructor(private moduleService: ModuleService) {}


  //Get all modules
  @Roles(['admin', 'instructor', 'student'])
  @Get()
  async getAllModules(): Promise<Module[]> {
    return await this.moduleService.findAll();
  }

  //get module by id
  @Get(':module_id')
  @Roles(['student', 'instructor'])
  async getModuleById(@Param('module_id') module_id: mongoose.Types.ObjectId, @Request() req:any) {
    const user_id = req.user.user_id
    const role = req.user.role
    if(!isValidObjectId(module_id)) throw new BadRequestException()
    // Get the module ID from the route parameters
    const module = await this.moduleService.findById(module_id, user_id, role);
    return module;
  }
  @Roles(['admin', 'instructor', 'student'])
  @Get('course/:course_id')
  findByCourseId(@Param('course_id') course_id: string) {
    return this.moduleService.findByCourseId(new mongoose.Types.ObjectId(course_id));
  }

  @Post()
  @Roles(['instructor'])
  async createModule(@Body() moduleData: createModuleDto) {
    // Get the new module data from the request body
    const newModule = await this.moduleService.create(moduleData);
    return newModule;
  }

  // Update a mocule's details by Id
  @Put(':module_id')
  @Roles(['instructor'])
  async updateModule(
    @Param('module_id') module_id: mongoose.Types.ObjectId,
    @Body() moduleData: updateModuleDto,
    @Request() req: any, // `req` contains `user` with the role and ID
  ) {
    const user_id = req.user.user_id; // Extract user ID from the request
    const updatedModule = await this.moduleService.update(module_id, moduleData, user_id);
    return updatedModule;
  }
  
  @Delete(':module_id')
  @Roles(['instructor'])
  async deleteModule(
    @Param('module_id') module_id: mongoose.Types.ObjectId,
    @Request() req: any, // `req` contains `user` with the role and ID
  ) {
    const user_id = req.user.user_id; // Extract user ID from the request
    const deletedModule = await this.moduleService.delete(module_id, user_id);
    return deletedModule;
  }
  
}
