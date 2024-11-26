import { Module } from '@nestjs/common'
import { StudentController } from './student.controller'
import { StudentService } from './student.service'
import { MongooseModule } from '@nestjs/mongoose'
import { StudentSchema } from 'src/student/models/student.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Student', schema: StudentSchema }])],
  exports: [MongooseModule],
  controllers: [StudentController],

  providers: [StudentService],
})
export class StudentModule {}
