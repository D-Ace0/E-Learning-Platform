import { Module } from '@nestjs/common';
import { FingerPrintService } from './finger-print.service';
import { FingerPrintController } from './finger-print.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [FingerPrintService],
  controllers: [FingerPrintController],
})
export class FingerPrintModule {}
