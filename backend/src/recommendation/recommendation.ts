import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ObjectId } from 'mongodb';

@Injectable()
export class RecommendationService {
  private flaskApiUrl = 'http://localhost:6000/recommend'; // Flask endpoint

  async getRecommendations(userData: { userId: ObjectId; courses: ObjectId[] }) {
    try {
      // Convert ObjectId values to strings before sending to Flask
      const payload = {
        userId: userData.userId.toString(),
        courses: userData.courses.map((course) => course.toString()),
      };

      const response = await axios.post(this.flaskApiUrl, payload);
      return response.data; // Recommended courses
    } catch (error) {
      if (error.response) {
        // Flask returned an error response
        throw new Error(
            `Failed to get recommendations: ${error.response.data?.error || 'Unknown error'}`
        );
      }
      // Other errors
      throw new Error(`Failed to connect to Flask API: ${error.message}`);
    }
  }
}
