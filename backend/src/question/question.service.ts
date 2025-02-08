import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from 'src/schemas/question.schema';
import { Model } from 'mongoose';
import { Module } from 'src/schemas/module.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Course } from 'src/schemas/course.schema';

@Injectable()
export class QuestionService {

  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Module.name) private moduleModel: Model<Module>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ){}

  async findAll(InstructorId: string) {
    const questions =  await this.questionModel.find({created_by: InstructorId})
    if(!questions) throw new NotFoundException("You need to add questions in your question bank")
    return questions
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto, InstructorId: string) {
    const existingQuestion = await this.questionModel.findOne({_id: id, created_by: InstructorId});
  
    if (!existingQuestion) {
      throw new NotFoundException('Question not found');
    }
  
    if((await this.questionModel.findById(id)).created_by.toString() !== InstructorId) throw new ForbiddenException()

    const oldAnswer = existingQuestion.answer;
  
    // Handle capitalization for True/False questions
    if (existingQuestion.type === 'True/False' && updateQuestionDto.answer) {
      const normalizedAnswer = updateQuestionDto.answer.trim().toLowerCase();
      if (normalizedAnswer === 'true' || normalizedAnswer === 'false') {
        updateQuestionDto.answer =
          normalizedAnswer.charAt(0).toUpperCase() + normalizedAnswer.slice(1);
      } else {
        throw new Error('Invalid answer for True/False question. Use "True" or "False".');
      }
    }
  
    // Handle MCQ options and answer consistency
    if (existingQuestion.type === 'MCQ' && updateQuestionDto.answer) {
      const updatedOptions = [...(existingQuestion.options || [])];
  
      for (let i = 0; i < updatedOptions.length; i++) {
        if (oldAnswer === updatedOptions[i]) {
          updatedOptions[i] = updateQuestionDto.answer; // Replace the old answer with the new one
          break;
        }
      }
  
      updateQuestionDto = {
        ...updateQuestionDto,
        options: updatedOptions, // Ensure options array is updated
      };
    }
  
    return await this.questionModel.findByIdAndUpdate(id, updateQuestionDto, {
      new: true, // Return the updated document
    });
  }
  
  

  async remove(id: string, InstructorId: string) {
    const question = await this.questionModel.findById(id)
    if(InstructorId !== question.created_by.toString()) throw new ForbiddenException()
    await this.questionModel.findByIdAndDelete(id)
  }

  async create(createQuestionDto: CreateQuestionDto, InstructorId: string) {
   try {
     // Validate module exists
     const module = await this.moduleModel.findById(createQuestionDto.module_id);
     if (!module) {
       throw new NotFoundException('Module not found');
     }
 
     // Create question
     const newQuestion = new this.questionModel({
       created_by: InstructorId,
       ...createQuestionDto
     });
     const savedQuestion = await newQuestion.save();
     // Add question to module's questions array
     await this.moduleModel.findByIdAndUpdate(
       createQuestionDto.module_id,
       { $push: { questions: savedQuestion._id } },
       { new: true },
     );
     return savedQuestion;
   } catch (error) {
    throw new BadRequestException(error)
   }
  }

  async findByModuleId(moduleId: string, userId: string, role: string) {
    const module = await this.moduleModel.findById(moduleId).populate('questions');
    if (!module) throw new NotFoundException('Module not found');
    
    const course = await this.courseModel.findById(module.course_id)
    if(role === 'instructor' && course.created_by.toString() !== userId) throw new ForbiddenException()
    
    if(role === 'student'){
    const isEnrolled = course.enrolledStudents.some((s) => s.toString() === userId)
    if(!isEnrolled) throw new ForbiddenException()
    }
    return module.questions
  }
}
