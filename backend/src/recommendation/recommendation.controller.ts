import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { RecommendationService } from './recommendation';
import { ObjectId } from 'mongodb';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post()
  async recommend(@Body() userData: { userId: string; courses: string[] }) {
    // Validate and convert userId and courses to ObjectId
    try {
      const userId = new ObjectId(userData.userId); // Convert userId to ObjectId
      const courses = userData.courses.map((course) => new ObjectId(course)); // Convert course IDs to ObjectId
      return this.recommendationService.getRecommendations({ userId, courses });
    } catch (error) {
      throw new BadRequestException('Invalid ObjectId format');
    }
  }
}
