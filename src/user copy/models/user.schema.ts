import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Course } from '../../course/models/course.schema'

export type UserDocument = HydratedDocument<User>

@Schema()
export class User {

  @Prop({ required: true, type: String  })
  name: string

  @Prop({ required: true, type: String, unique: true })
  email: string

  @Prop({ required: true, type: String })
  password_hash: string

  @Prop({ required: false, type: String})
  profile_picture_url?: string

  @Prop({ required: true, type: Date, default: Date.now })
  created_at?: Date

  @Prop({ required: false, default: [], type: [mongoose.Schema.Types.ObjectId], ref: () => Course} as PropOptions)
  courses?: mongoose.Schema.Types.ObjectId[]
  
}

export const UserSchema = SchemaFactory.createForClass(User)