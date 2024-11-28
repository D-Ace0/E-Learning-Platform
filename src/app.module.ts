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
import { DashboardModule } from './dashboard/dashboard.module'
import { ResourceAccessGuard } from './guards/resource-access.guard'
dotenv.config();


@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtService
    },
    Logger,
    ResourceAccessGuard
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
    DashboardModule,
    MongooseModule.forRoot('mongodb+srv://AhmedKhadrawy:9g3bcGpd2Ay9v0LR@database.r38ac.mongodb.net/E-Learning-Platform')
    // MongooseModule.forRoot(
    //   'mongodb+srv://abdelrahmanahmed75a:PO0kY6HyPet6zamr@e-learning.sdk3y.mongodb.net/', {}),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*')
  }
}