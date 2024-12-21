import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recommendation, RecommendationDocument} from "../schemas/Recommendation.schema";
import axios from 'axios';
import {ObjectId} from "mongodb";
@Injectable()
export class RecommendationService {
  private flaskApiUrl = 'http://localhost:6000/recommend'; // Flask endpoint

  constructor(
      @InjectModel(Recommendation.name)
      private readonly recommendationModel: Model<RecommendationDocument>,
  ) {}

  async getRecommendations(userData: { userId: ObjectId; courses: ObjectId[] }) {
    try {
      console.log('Sending payload to Flask API:', userData);

      const response = await axios.post(this.flaskApiUrl, userData);
      console.log('Flask API Response:', response.data);

      await this.saveRecommendations(userData.userId, response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getRecommendations:', error.response?.data || error.message);
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }

  async saveRecommendations(userId: ObjectId, recommendedItems: string[]) {
    console.log('Saving recommendations for user:', userId, 'Items:', recommendedItems);

    const existingRecommendation = await this.recommendationModel.findOne({ user_id: userId });
    console.log('Existing recommendation:', existingRecommendation);

    if (existingRecommendation) {
      existingRecommendation.recommended_items = recommendedItems;
      existingRecommendation.generated_at = new Date();
      await existingRecommendation.save();
      console.log('Updated existing recommendation:', existingRecommendation);
    } else {
      const newRecommendation = new this.recommendationModel({
        user_id: userId,
        recommended_items: recommendedItems,
      });
      await newRecommendation.save();
      console.log('Saved new recommendation:', newRecommendation);
    }
  }

}