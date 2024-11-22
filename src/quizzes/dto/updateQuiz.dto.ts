import mongoose from 'mongoose'

export class updateQuizDto{
  quiz_id: mongoose.Types.ObjectId;
  module_id?: mongoose.Types.ObjectId
  questions?: string[]
  created_at?: Date
}