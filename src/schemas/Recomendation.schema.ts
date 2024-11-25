import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { User } from '../user/models/user.schema'

export type RecommendationDocument = Recommendation & Document

@Schema()
export class Recommendation extends Document {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => User } as PropOptions)
  user_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: [String] })
  recommended_items: string[]

  @Prop({ required: false, type: Date, default: Date.now })
  generated_at?: Date
}

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation)
