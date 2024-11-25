import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema } from 'src/schemas/course.schema';
import { CourseController } from './courses.controller';
import { CourseService } from './courses.service';



@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Course', schema: CourseSchema }])],
  providers: [CourseService],
  controllers: [CourseController]
})
export class CourseModule {}
    