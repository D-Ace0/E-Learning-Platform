import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { QuizSchema} from 'src/quiz/models/quiz.schema'
import { QuizController } from 'src/quiz/quiz.controller'
import { QuizService } from 'src/quiz/quiz.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Quiz', schema: QuizSchema }])],
  providers: [QuizService],
  controllers: [QuizController],
})
export class QuizModule {}
