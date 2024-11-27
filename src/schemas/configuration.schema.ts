import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import { User } from './user.schema'
import mongoose, { Document } from 'mongoose'

export type ConfigurationDocument = Configuration & Document

@Schema()
export class Configuration {

  @Prop({ required: true, type: Object })
  settings: Record<string, any> //double check

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => User } as PropOptions)
  updated_by: mongoose.Types.ObjectId

  @Prop({ required: false, type: Date, default: Date.now })
  updated_at?: Date
}

export const ConfigurationSchema = SchemaFactory.createForClass(Configuration)
