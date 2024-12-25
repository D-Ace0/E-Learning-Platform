import { Module } from '@nestjs/common';
import { ForumsService } from './forums.service';
import { ForumsController } from './forums.controller';
import { Course, CourseSchema } from 'src/schemas/course.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Forum, ForumSchema } from 'src/schemas/forums.schema';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: Forum.name, schema: ForumSchema }]),
      MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }])],
  controllers: [ForumsController],
  providers: [ForumsService],
})
export class ForumsModule {}
