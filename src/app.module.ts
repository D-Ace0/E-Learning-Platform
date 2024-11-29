import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { MongooseModule } from '@nestjs/mongoose'
import { NotesModule } from './notes/notes.module'
import * as process from 'node:process'
import * as dotenv from 'dotenv'
import { APP_GUARD } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { LoggingMiddleware } from './middleware/loggerMiddleware'
import { AuthorizationGuard } from './guards/authorization.guard'
import { CourseModule } from './Courses/courses.module'
import { QuizModule } from './quizzes/quiz.module'
import { ModuleModule } from './modules/module.module'
import { MfaModule } from './mfa/mfa.module'
import { MailModule } from './mail/mail.module'
dotenv.config();


@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtService
    },
    Logger
  ],
  imports: [
    MailModule,
    QuizModule,
    AuthModule,
    CourseModule,
    UsersModule,
    NotesModule,
    ModuleModule,
    MfaModule, 
    MongooseModule.forRoot('mongodb://localhost:27017/E-Learning-Platform')
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*')
  }
}