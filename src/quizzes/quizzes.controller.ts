import { Controller, Post, Get, Param, Body, NotFoundException } from '@nestjs/common'
import { QuizzesService } from './quizzes.service'
import { CreateQuizDto } from './dto/quizzes.dto'
import { Quiz } from 'src/schemas/quiz.schema'

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post('/courses/:courseId')
  async createQuiz(
    @Param('courseId') courseId: string,
    @Body() createQuizDto: CreateQuizDto,
  ): Promise<Quiz> {
    return this.quizzesService.create(courseId, createQuizDto)
  }

  @Get('/:quizId')
  async getQuiz(@Param('quizId') quizId: string): Promise<Quiz> {
    const quiz = await this.quizzesService.findOne(quizId)
    if (!quiz) {
      throw new NotFoundException('Quiz not found.')
    }
    return quiz;
  }
}
