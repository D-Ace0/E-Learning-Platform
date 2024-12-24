import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from 'src/schemas/question.schema';
import { Model } from 'mongoose';

@Injectable()
export class QuestionService {

  constructor(@InjectModel(Question.name) private questionModel: Model<Question>){}

  async findAll() {
    return await this.questionModel.find({})
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    const existingQuestion = await this.questionModel.findById(id);
  
    if (!existingQuestion) {
      throw new NotFoundException('Question not found');
    }
  
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
  
  

  async remove(id: string) {
    return await this.questionModel.findByIdAndDelete(id)
  }
}
