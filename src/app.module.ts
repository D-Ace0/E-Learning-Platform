import { Logger, Module} from '@nestjs/common'
import { UsersModule } from './user/users.module'
import { MongooseModule } from '@nestjs/mongoose'
import { NotesModule } from './note/note.module'
import * as dotenv from 'dotenv'
import { APP_GUARD } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { CourseModule } from './course/course.module'
import { QuizModule } from './quiz/quiz.module'
import { ModuleModule } from './module/module.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

dotenv.config()


@Module({
  imports: [
    QuizModule,
    CourseModule,
    UsersModule,
    NotesModule,
    ModuleModule,
    MongooseModule.forRoot(
      'mongodb+srv://abdelrahmanahmed75a:PO0kY6HyPet6zamr@e-learning.sdk3y.mongodb.net/', {}),
  ],
  controllers: [AppController],
  providers: [AppService]
})

export class AppModule {}