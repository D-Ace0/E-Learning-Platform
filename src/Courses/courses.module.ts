import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from 'src/schemas/course.schema';
import { UploadService } from 'src/Upload Module/upload.module';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Thread, ThreadSchema } from 'src/schemas/thread.schema';
import { Post, PostSchema } from 'src/schemas/post.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
     MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
     MongooseModule.forFeature([{name: Thread.name, schema: ThreadSchema}]),
     MongooseModule.forFeature([{name: Post.name, schema: PostSchema}])
  ],
  controllers: [CoursesController],
  providers: [CoursesService, UploadService], 
  exports: [CoursesService], 
})
export class CourseModule {}
    