import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { MongooseModule } from '@nestjs/mongoose';

import { RecommendationSchema } from '../schemas/Recomendation.schema';

@Module({
  imports:[
  MongooseModule.forFeature([{ name: 'Recommendation', schema: RecommendationSchema }])],
  providers: [RecommendationService],
  controllers: [RecommendationController]
})
export class RecommendationModule {}
