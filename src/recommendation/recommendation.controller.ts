import { Controller, Get } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}


}
