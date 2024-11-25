import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesSchema } from 'src/schemas/courses.schema';
import { CourseController } from './courses.controller';
import { CourseService } from './courses.service';



@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Course', schema: CoursesSchema }])],
  providers: [CourseService],
  controllers: [CourseController]
})
export class CourseModule {}
    