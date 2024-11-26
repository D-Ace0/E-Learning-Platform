import { Logger, Module} from '@nestjs/common'
import { UserModule } from './user/user.module'
import { MongooseModule } from '@nestjs/mongoose'
import { NoteModule } from './note/note.module'
import * as dotenv from 'dotenv'
import { CourseModule } from './course/course.module'
import { QuizModule } from './quiz/quiz.module'
import { ModuleModule } from './module/module.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { StudentModule } from './student/student.module'
import { InstructorModule } from './instructor/instructor.module'
import { AdminModule } from './admin/admin.module'

dotenv.config()


@Module({
  imports: [
    QuizModule,
    CourseModule,
    UserModule,
    StudentModule,
    InstructorModule,
    AdminModule,
    NoteModule,
    ModuleModule,
    MongooseModule.forRoot(
      'mongodb+srv://abdelrahmanahmed75a:PO0kY6HyPet6zamr@e-learning.sdk3y.mongodb.net/test', {}),
  ],
  controllers: [AppController],
  providers: [AppService]
})

export class AppModule {}