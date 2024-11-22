import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesModule } from './notes/notes.module';
import * as process from 'node:process';
import * as dotenv from 'dotenv';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { LoggingMiddleware } from './middleware/loggerMiddleware';
import { AuthorizationGuard } from './guards/authorization.guard';
import { DashboardModule } from './dashboard/dashboard.module';
import { CourseModule } from './Courses/courses.module';
import { PusherService } from './pusher/pusher.service';
import { QuizModule } from './quizzes/quiz.module';
import { ModuleModule } from './modules/module.module';
dotenv.config();

const MONGO_URI: string = process.env.MONGO_URI;
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtService,
    },
    Logger,
    PusherService,
  ],
  imports: [
    QuizModule,
    AuthModule,
    CourseModule,
    UsersModule,
    NotesModule,
    DashboardModule,
    ModuleModule,
    MongooseModule.forRoot(
      MONGO_URI ?? 'mongodb://127.0.0.1:27017/E-Learning-Platform',
    ),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
