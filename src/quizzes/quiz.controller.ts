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
import { QuizService } from 'src/quizzes/quiz.service';
import { Quiz } from 'src/schemas/quiz.schema';
import { createQuizDto } from 'src/quizzes/dto/createQuiz.dto';
import { updateQuizDto } from 'src/quizzes/dto/updateQuiz.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import mongoose from 'mongoose';




@Controller('quiz')
//@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class QuizController {
  constructor(private quizService: QuizService) {}

  //Get all quizzes
  @Get()
  async getAllQuizzes(): Promise<Quiz[]> {
    return await this.quizService.findAll();
  }

  //get quiz by id
  @Get(':quiz_id')
  async getQuizById(@Param('quiz_id') quiz_id: mongoose.Types.ObjectId) {
    // Get the quiz ID from the route parameters
    const quiz = await this.quizService.findById(quiz_id);
    return quiz;
  }

  //Create quiz
  @Post()
  //@Roles(['instructor'])
  async createQuiz(@Body() quizData: createQuizDto) {
    // Get the new student data from the request body
    const newQuiz = await this.quizService.create(quizData);
    return newQuiz;
  }

  // Update a quiz's details
  @Put(':quiz_id')
  //@Roles(['instructor'])
  async updateQuiz(
    @Param('quiz_id') quiz_id: mongoose.Types.ObjectId,
    @Body() quizData: updateQuizDto,
  ) {
    const updatedQuiz = await this.quizService.update(quiz_id, quizData);
    return updatedQuiz;
  }

  // Delete a quiz by id
  //@Roles(['instructor'])
  @Delete(':quiz_id')
  async deleteQuiz(@Param('quiz_id') quiz_id: mongoose.Types.ObjectId) {
    const deletedQuiz = await this.quizService.delete(quiz_id);
    return deletedQuiz;
  }
}
