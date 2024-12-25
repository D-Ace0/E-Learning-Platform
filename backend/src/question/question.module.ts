import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionSchema } from 'src/schemas/question.schema';
import { ModuleSchema } from 'src/schemas/module.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Question', schema: QuestionSchema },
      { name: 'Module', schema: ModuleSchema },
    ]),
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}
