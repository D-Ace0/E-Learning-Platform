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
import { ChatGateway } from './communication_handler/WebSocket_Gateway';
import {RoomModule} from './communication_handler/Communication_Modules/room.module';
import {MessagesModule} from './communication_handler/Communication_Modules/MessagesModule';
import { BackupModule } from './backup/backup.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { ResourceAccessGuard } from './guards/resource-access.guard'
import { RecommendationModule } from './recommendation/recommendation.module';
import { QuestionModule } from './question/question.module';
import { ForumsModule } from './forums/forums.module';
import { PostsModule } from './posts/posts.module';
import { ThreadsModule } from './threads/threads.module';
import { FingerPrintModule } from './finger-print/finger-print.module'
dotenv.config();

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtService,  // You might want to use the actual AuthGuard or AuthorizationGuard here
    },
    Logger,
     ChatGateway,
    ResourceAccessGuard
  ],
  imports: [
    RecommendationModule,
    FingerPrintModule,
    BackupModule,
    MailModule,
    QuizModule,
    AuthModule,
    CourseModule,
    UsersModule,
    NotesModule,
    ModuleModule,
    RoomModule,
    MessagesModule,
    MfaModule, 
    DashboardModule,
    QuestionModule,
    ForumsModule,
    PostsModule,
    ThreadsModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
    QuestionModule
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
    console.log('connected to DB Succefully !')
  }
}
