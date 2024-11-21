import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { QuizzesController } from 'src/quizzes/quizzes.controller'
import { QuizzesService } from './quizzes.service'
import { Quiz, QuizSchema } from 'src/schemas/quiz.schema'
import { Course, CourseSchema } from 'src/schemas/course.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: Course.name, schema: CourseSchema }, 
    ]),
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}
