import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from 'src/schemas/course.schema';
import { UploadService } from 'src/Upload Module/upload.module';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UserInteraction, UserInteractionSchema } from 'src/schemas/user_interaction';
import { Progress, ProgressSchema } from 'src/schemas/progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: UserInteraction.name, schema: UserInteractionSchema }]),
    MongooseModule.forFeature([{ name: Progress.name, schema: ProgressSchema }]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [MongooseModule], // Export MongooseModule so CourseModel is accessible in other modules
})
export class CourseModule {}
