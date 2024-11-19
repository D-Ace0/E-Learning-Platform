import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import mongoose, { Document } from 'mongoose';

export type ConfigurationDocument = Configuration & Document;

@Schema()
export class Configuration {
  @Prop({ required: true, unique: true })
  config_id: string;

  @Prop({ required: true, type: Object })
  settings: Record<string, any>; //double check

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User })
  updated_by: string;

  @Prop({ required: true, type: Date, default: Date.now })
  updated_at: Date;
}

export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);
