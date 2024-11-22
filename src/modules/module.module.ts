 import { MongooseModule } from '@nestjs/mongoose';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { ModuleSchema } from '../schemas/module.schema';
 import { Module } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Module.name, schema: ModuleSchema }]),
  ],
  controllers: [ModuleController],
  providers: [ModuleService],
})
export class ModuleModule {}
