import { Schema, Prop, SchemaFactory, PropOptions } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { User } from 'src/user/models/user.schema'
import { Course } from 'src/course/models/course.schema'

export type NoteDocument = HydratedDocument<Note>

@Schema()
export class Note {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => User } as PropOptions)
  user_id: mongoose.Schema.Types.ObjectId

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: () => Course } as PropOptions)
  course_id?: mongoose.Schema.Types.ObjectId

  @Prop({ required: true, type: String })
  content: string

  @Prop({ required: false, type: Date, default: Date.now })
  created_at?: Date

  @Prop({ required: false, type: Date, default: Date.now })
  last_updated?: Date
}

export const NoteSchema = SchemaFactory.createForClass(Note)
