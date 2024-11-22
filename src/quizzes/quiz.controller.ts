import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { QuizService } from 'src/quizzes/quiz.service';
import { quiz } from 'src/schemas/quiz.schema';
import { createQuizDto } from 'src/quizzes/dto/createQuiz.dto';
import { updateQuizDto } from 'src/quizzes/dto/updateQuiz.dto';
import mongoose from 'mongoose'

@Controller('quiz')
export class QuizController {
  constructor(private quizService: QuizService) {}

  //Get all quizzes
  @Get()
  async getAllQuizzes(): Promise<quiz[]> {
      return await this.quizService.findAll();
  }

  //get quiz by id
  @Get(':quiz_id')
    async getQuizById(@Param('quiz_id') quiz_id: mongoose.Types.ObjectId) {// Get the quiz ID from the route parameters
        const course = await this.quizService.findById(quiz_id);
        return course;
    }
  
  //Create quiz
  @Post()
  async createQuiz(@Body()quizData: createQuizDto) {// Get the new student data from the request body
      const newQuiz = await this.quizService.create(quizData);
      return newQuiz;
  }

  // Update a quiz's details
  @Put(':quiz_id')
  async updateQuiz(@Param('quiz_id') quiz_id:mongoose.Types.ObjectId,@Body()quizData: updateQuizDto) {
    const updatedQuiz = await this.quizService.update(quiz_id, quizData);
    return updatedQuiz;      
  }
  // Delete a quiz by id
  @Delete(':quiz_id')
  async deleteQuiz(@Param('quiz_id') quiz_id:mongoose.Types.ObjectId) {
    const deletedQuiz = await this.quizService.delete(quiz_id);
    return deletedQuiz;
  }
}
