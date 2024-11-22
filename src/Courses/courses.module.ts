import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from 'src/schemas/course.schema';
import { UploadService } from 'src/Upload Module/upload.module';
import { User, UserSchema } from 'src/schemas/user.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
     MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [CoursesController],
  providers: [CoursesService, UploadService], 
  exports: [CoursesService], 
})
export class CourseModule {}
    