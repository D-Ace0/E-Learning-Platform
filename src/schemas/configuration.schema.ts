import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
@Schema()
export class Configuration extends Document {
  @Prop({ required: true, unique: true })
  config_id: string; 

  @Prop({ required: true, type: Object })
  settings: Record<string, any>; 

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updated_by: string; 

  @Prop({default: Date.now})
  updated_at: Date; 
}

export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);
