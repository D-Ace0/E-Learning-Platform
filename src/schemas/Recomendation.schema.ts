import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { User } from '../user/models/user.schema'

export type RecommendationDocument = HydratedDocument<Recommendation>

@Schema()
export class Recommendation {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => User } as PropOptions)
  user_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: [String] })
  recommended_items: string[]

  @Prop({ required: false, type: Date, default: Date.now })
  generated_at?: Date
}

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation)
