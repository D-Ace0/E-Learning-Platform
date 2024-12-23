import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { ModuleSchema } from '../schemas/module.schema';
import { CourseSchema } from 'src/schemas/course.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Module', schema: ModuleSchema },
    { name: 'Course', schema: CourseSchema },
  ])
  ],
  providers: [ModuleService],
  controllers: [ModuleController]
})
export class ModuleModule {}
