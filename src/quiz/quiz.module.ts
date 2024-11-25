import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizSchema} from 'src/quiz/models/quiz.schema';
import { QuizController } from 'src/quizzes/quiz.controller';
import { QuizService } from 'src/quizzes/quiz.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Quiz', schema: QuizSchema }])],
  providers: [QuizService],
  controllers: [QuizController],
})
export class QuizModule {}
