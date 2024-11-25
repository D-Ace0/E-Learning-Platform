import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
<<<<<<< HEAD
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from 'src/schemas/course.schema';
import { UploadService } from 'src/Upload Module/upload.module';
import { User, UserSchema } from 'src/schemas/user.schema';
=======
import { CoursesSchema } from 'src/schemas/courses.schema';
import { CourseController } from './courses.controller';
import { CourseService } from './courses.service';

>>>>>>> 997b3fe (dashboard now shows user, courses and completion percentage)


@Module({
  imports: [
<<<<<<< HEAD
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
     MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [CoursesController],
  providers: [CoursesService, UploadService], 
  exports: [CoursesService], 
=======
    MongooseModule.forFeature([{ name: 'Course', schema: CoursesSchema }])],
  providers: [CourseService],
  controllers: [CourseController]
>>>>>>> 997b3fe (dashboard now shows user, courses and completion percentage)
})
export class CourseModule {}
    