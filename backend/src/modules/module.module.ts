import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { ModuleSchema } from '../schemas/module.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Module', schema: ModuleSchema }])],
  providers: [ModuleService],
  controllers: [ModuleController]
})
export class ModuleModule {}
