import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation';
import { RecommendationController } from './recommendation.controller';

@Module({
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
