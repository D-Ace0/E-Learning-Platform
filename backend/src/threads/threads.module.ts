import { Module } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from 'src/schemas/course.schema';
import { Thread, ThreadSchema } from 'src/schemas/thread.schema';
import { Forum, ForumSchema } from 'src/schemas/forums.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    MongooseModule.forFeature([{ name: Thread.name, schema: ThreadSchema }]),
    MongooseModule.forFeature([{ name: Forum.name, schema: ForumSchema }]),
  ],
  controllers: [ThreadsController],
  providers: [ThreadsService],
})
export class ThreadsModule {}
