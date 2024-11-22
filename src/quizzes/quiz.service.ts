import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { quiz } from 'src/schemas/quiz.schema';
import { createQuizDto } from 'src/quizzes/dto/createQuiz.dto';
import { updateQuizDto } from 'src/quizzes/dto/updateQuiz.dto';
import mongoose from 'mongoose';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(quiz.name) private quizModel: mongoose.Model<quiz>
  ) {}

  // create a quiz
  async create(quizData: createQuizDto): Promise<quiz> {
    const newQuiz = new this.quizModel(quizData); // Use DTO for quiz creation
    return await newQuiz.save(); // Save it to the database
  }

  // Get all quizzes
  async findAll(): Promise<quiz[]> {
    let courses= await this.quizModel.find();  // Fetch all quizzes from the database
    return courses
  }

  // Get a quiz by ID
  async findById(quiz_id: mongoose.Types.ObjectId): Promise<quiz> {
    return await this.quizModel.findById(quiz_id);  // Fetch a quiz by ID
  }

  // Update a quiz's details by ID
  async update(quiz_id: mongoose.Types.ObjectId, updateData: updateQuizDto): Promise<quiz> {
    return await this.quizModel.findByIdAndUpdate(quiz_id, updateData, { new: true });  // Find and update the quiz
  } 

  // Delete a quiz by ID
  async delete(quiz_id: mongoose.Types.ObjectId): Promise<quiz> {
    return await this.quizModel.findByIdAndDelete(quiz_id);  // Find and delete the quiz
  }

}