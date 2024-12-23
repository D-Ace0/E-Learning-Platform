import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizSchema} from 'src/schemas/quiz.schema';
import { QuizController } from 'src/quizzes/quiz.controller';
import { QuizService } from 'src/quizzes/quiz.service';
import { QuizPerformanceSchema } from 'src/schemas/quiz_performance.schmea';
import { QuestionSchema } from 'src/schemas/question.schema';
import { QuizSelectionSchema } from 'src/schemas/quizSelection.schema';
import { CourseSchema } from 'src/schemas/course.schema';
import { ModuleSchema } from 'src/schemas/module.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Quiz', schema: QuizSchema }, 
    {name: 'QuizPerformance', schema: QuizPerformanceSchema},
    {name: 'QuizSelection', schema: QuizSelectionSchema},
     {name: 'Question', schema: QuestionSchema},
      {name: 'Course', schema: CourseSchema},
        {name: 'Module', schema: ModuleSchema},
    ])],
  providers: [QuizService],
  controllers: [QuizController],
})
export class QuizModule {}
