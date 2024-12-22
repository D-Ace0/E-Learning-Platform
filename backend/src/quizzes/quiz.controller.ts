import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
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
import { SubmitQuizDto } from './dto/submitQuiz.dto';




@Controller('quiz')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class QuizController {
  constructor(private quizService: QuizService) {}

  //Get all quizzes
  @Roles(['student', 'instructor', 'admin'])
  @Get()
  async getAllQuizzes(): Promise<Quiz[]> {
    return await this.quizService.findAll();
  }

  @Get('module/:module_id')
  async getQuizzesByModuleId(@Param('module_id') module_id: string): Promise<Quiz[]> {
    return await this.quizService.findByModuleId(module_id);
  }

  //get quiz by id
  @Get(':quiz_id')
  async getQuizById(@Param('quiz_id') quiz_id: string) {
    // Get the quiz ID from the route parameters
    const quiz = await this.quizService.findById(quiz_id);
    return quiz;
  }

  //Create quiz
  @Post()
  @Roles(['instructor'])
  async createQuiz(@Body() quizData: createQuizDto) {
    // Get the new student data from the request body
    const newQuiz = await this.quizService.create(quizData);
    return newQuiz;
  }

  // Update a quiz's details
  @Put(':quiz_id')
  @Roles(['instructor'])
  async updateQuiz(
    @Param('quiz_id') quiz_id: mongoose.Types.ObjectId,
    @Body() quizData: updateQuizDto,
  ) {
    const updatedQuiz = await this.quizService.update(quiz_id, quizData);
    return updatedQuiz;
  }

  // Delete a quiz by id
  @Roles(['instructor'])
  @Delete(':quiz_id')
  async deleteQuiz(@Param('quiz_id') quiz_id: mongoose.Types.ObjectId) {
    const deletedQuiz = await this.quizService.delete(quiz_id);
    return deletedQuiz;
  }


  @Roles(['student'])
  @Post('submit/:quizId')
  async submitQuiz(@Request() req: any, @Param('quizId') quizId: string, @Body() submitQuizDto: SubmitQuizDto) {
    const studentId = req.user.user_id;
    return this.quizService.submitQuiz(studentId, quizId, submitQuizDto.answers);
  }
  

  @Roles(['student'])
  @Get(':quizId/questions')
  async getQuizQuestions(@Param("quizId") quizId: string, @Request() req:any){
    const studentId = req.user_id
    return this.quizService.getQuizQuestions(quizId, studentId)
  }

}
