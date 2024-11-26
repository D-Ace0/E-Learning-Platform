import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import { User } from 'src/user/models/user.schema'
import mongoose, { HydratedDocument } from 'mongoose'

export type CourseDocument = HydratedDocument<Course>

enum difficulty_levels {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Schema()
export class Course {
  @Prop({ required: true, unique: true, type: String })
  code: string

  @Prop({ required: true, type: String })
  title: string

  @Prop({ required: true, type: String })
  description: string

  @Prop({ required: true, type: String })
  category: string

  @Prop({ required: true, enum: difficulty_levels, type: String })
  difficulty_level: string

  @Prop({ required: true, type: String })
  created_by: string

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => User } as PropOptions)
  created_by_id: mongoose.Types.ObjectId

  @Prop({ required: false, type: Date, default: Date.now })
  created_at?: Date

  @Prop({ required: true, type: String })
  video: string

  @Prop({ required: true, type: String })
  pdf: string

  @Prop({ required: false, default: null, type: mongoose.Schema.Types.ObjectId })
  parent_version?: mongoose.Schema.Types.ObjectId
  
}

export const CourseSchema = SchemaFactory.createForClass(Course)
