import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
@Schema({ timestamps: true })
export class Recommendation extends Document {
  @Prop({ required: true, type: String })
  recommendationId!: string; // Unique identifier for the recommendation

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: [String] })
  recommendedItems!: string[]; // Array of recommended courses/modules

  @Prop({ required: true, type: Date })
  generatedAt!: Date; // Timestamp of recommendation generation
}

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation);
