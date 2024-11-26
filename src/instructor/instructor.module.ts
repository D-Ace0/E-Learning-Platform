import { Module } from '@nestjs/common'
import { InstructorController } from 'src/instructor/instructor.controller'
import { InstructorService } from 'src/instructor/instructor.service'
import { MongooseModule } from '@nestjs/mongoose'
import { InstructorSchema } from 'src/instructor/models/instructor.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Instructor', schema: InstructorSchema }])],
  exports: [MongooseModule],
  controllers: [InstructorController],

  providers: [InstructorService],
})
export class InstructorModule {}
