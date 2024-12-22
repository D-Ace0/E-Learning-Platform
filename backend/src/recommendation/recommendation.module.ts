import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation';
import { RecommendationController } from './recommendation.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Recommendation,RecommendationSchema} from "../schemas/Recommendation.schema";
import{User,UserSchema} from "../schemas/user.schema";
import{Progress,ProgressSchema} from "../schemas/progress.schema";
import{Course,CourseSchema} from "../schemas/course.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recommendation.name, schema: RecommendationSchema },
      {name:User.name, schema: UserSchema },
      {name:Course.name, schema: CourseSchema },
      {name:Progress.name, schema: ProgressSchema},
    ]),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
