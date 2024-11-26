import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CourseSchema } from 'src/course/models/course.schema'
import { CourseController } from './course.controller'
import { CourseService } from './course.service'



@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Course', schema: CourseSchema }])],
  providers: [CourseService],
  controllers: [CourseController]
})

export class CourseModule {}
    