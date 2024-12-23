import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';;
import { Module} from 'src/schemas/module.schema';
import { createModuleDto } from 'src/modules/dto/createModule.dto';
import { updateModuleDto } from 'src/modules/dto/updateModule.dto';
import mongoose from 'mongoose';
import { Course } from 'src/schemas/course.schema';



@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Module.name) private moduleModel: mongoose.Model<Module>, // Injects the Module model
    @InjectModel(Course.name) private courseModel: mongoose.Model<Course>, // Injects the Module model
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
  async findById(module_id: mongoose.Types.ObjectId, user_id: string, role: string): Promise<Module> {
    const module = await this.moduleModel.findById(module_id);
    if (!module) {
      throw new NotFoundException(`Module with ID ${module_id} not found`);
    }
  
    const course = await this.courseModel.findById(module.course_id);
  
    if (role === "student") {
      // Check if the student is allowed to access the module via quizzes
      return module;
    } else if (role === "instructor" && course.created_by.toString() !== user_id) {
      throw new ForbiddenException("You can't view Modules of other instructors");
    }
  
    return module;
  }
  

   // New method to find modules by course_id
 async findByCourseId(course_id: mongoose.Types.ObjectId) {
  return await this.moduleModel.find({ course_id: course_id }).exec();
}

  // updates
  async verifyOwnership(module_id: mongoose.Types.ObjectId, user_id: string): Promise<boolean> {
    // Find the module by its ID
    const module = await this.moduleModel.findById(module_id);
  
    if (!module) {
      throw new NotFoundException('Module not found');
    }
  
    // Find the course associated with the module
    const course = await this.courseModel.findById(module.course_id);
  
    if (!course) {
      throw new NotFoundException('Course not found for this module');
    }
  
    // Check if the course was created by the current user
    return course.created_by.toString() === user_id.toString();
  }
  
  async update(module_id: mongoose.Types.ObjectId, updateData: updateModuleDto, user_id: string): Promise<Module> {
    const isOwner = await this.verifyOwnership(module_id, user_id);
  
    if (!isOwner) {
      throw new ForbiddenException('You are not authorized to update this module');
    }
  
    return await this.moduleModel.findByIdAndUpdate(module_id, updateData, { new: true });
  }
  
  async delete(module_id: mongoose.Types.ObjectId, user_id: string): Promise<Module> {
    const isOwner = await this.verifyOwnership(module_id, user_id);
  
    if (!isOwner) {
      throw new ForbiddenException('You are not authorized to delete this module');
    }
  
    return await this.moduleModel.findByIdAndDelete(module_id);
  }
  
}
