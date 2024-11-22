import mongoose from 'mongoose'

export class updateModuleDto{
  module_id: mongoose.Types.ObjectId
  course_id?: mongoose.Types.ObjectId
  title?: string
  content?: string
  resources?: string[]
  created_at?: Date
}