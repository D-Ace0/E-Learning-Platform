import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation';
import { RecommendationController } from './recommendation.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Recommendation,RecommendationSchema} from "../schemas/Recommendation.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recommendation.name, schema: RecommendationSchema },
    ]),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
