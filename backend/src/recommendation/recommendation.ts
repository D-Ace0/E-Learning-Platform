import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecommendationService {
  private flaskApiUrl = 'http://localhost:5000/recommend'; // Flask endpoint

  async getRecommendations(userData: { userId: string; courses: string[] }) {
    try {
      const response = await axios.post(this.flaskApiUrl, userData);
      return response.data; // Recommended courses
    } catch (error) {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }
}
