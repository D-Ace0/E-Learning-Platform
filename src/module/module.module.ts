import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleController } from 'src/module/module.controller';
import { ModuleService } from 'src/module/module.service';
import { ModuleSchema } from 'src/module/models/module.schema';



@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Module', schema: ModuleSchema }])],
  providers: [ModuleService],
  controllers: [ModuleController]
})

export class ModuleModule {}
