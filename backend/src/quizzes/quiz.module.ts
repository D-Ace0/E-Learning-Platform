import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizSchema} from 'src/schemas/quiz.schema';
import { QuizController } from 'src/quizzes/quiz.controller';
import { QuizService } from 'src/quizzes/quiz.service';
import { QuizPerformanceSchema } from 'src/schemas/quiz_performance.schmea';
import { QuestionSchema } from 'src/schemas/question.schema';
import { QuizSelectionSchema } from 'src/schemas/quizSelection.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Quiz', schema: QuizSchema }, 
    {name: 'QuizPerformance', schema: QuizPerformanceSchema},
    {name: 'QuizSelection', schema: QuizSelectionSchema},
     {name: 'Question', schema: QuestionSchema}
    ])],
  providers: [QuizService],
  controllers: [QuizController],
})
export class QuizModule {}
