import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CoursesController } from './courses.controller';

import { UploadService } from 'src/Upload Module/upload.module';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Course, CoursesSchema } from 'src/schemas/courses.schema';
import { CoursesService } from './courses.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CoursesSchema }]),
     MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [CoursesController],
  providers: [CoursesService, UploadService], 
  exports: [CoursesService], 
})
export class CourseModule {}
    