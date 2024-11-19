import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';

export type RecommendationDocument = Recommendation & Document;

@Schema()
export class Recommendation extends Document {
  @Prop({ required: true, type: String })
  recommendation_id: string; // Unique identifier for the recommendation

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: [String] })
  recommendedItems: string[];

  @Prop({ required: true, type: Date, default: Date.now })
  generated_at: Date;
}

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation);
