import { Module } from '@nestjs/common';
import { QuizService } from 'src/quizzes/quiz.service';
import { QuizController } from 'src/quizzes/quiz.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizSchema } from 'src/schemas/quiz.schema';

@Module({
  imports:[  MongooseModule.forFeature([{ name: 'quiz', schema: QuizSchema }])],
  providers: [QuizService],
  controllers: [QuizController]
})
export class QuizModule {}
