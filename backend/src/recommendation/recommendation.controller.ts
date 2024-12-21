import {Controller, Post, Body, BadRequestException, Param, Get} from '@nestjs/common';
import { RecommendationService } from './recommendation';
import { ObjectId } from 'mongodb';
import mongoose from "mongoose";


@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post()
  async recommend(@Body() userData: { userId: ObjectId; courses: ObjectId[] }) {
    // Validate and convert userId and courses to ObjectId
    try {
      const userId = new ObjectId(userData.userId); // Convert userId to ObjectId
      const courses = userData.courses.map((course) => new ObjectId(course)); // Convert course IDs to ObjectId
      return this.recommendationService.getRecommendations({ userId, courses });
    } catch (error) {
      throw new BadRequestException('Invalid ObjectId format');
    }
  }
  @Post('/:Title/:userId')
  async addRecommendedCourseToUser(
      @Param('Title') title: string,
      @Param('userId') userId: mongoose.Schema.Types.ObjectId,
  ) {
    return this.recommendationService.addRecommendedCourseToUser({userId, title,})
  }

  @Get(':userId')
  async getCourses(@Param('userId') userId: mongoose.Schema.Types.ObjectId) {
    return this.recommendationService.getCourses(userId)
  }
}
