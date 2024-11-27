import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Quiz } from 'src/schemas/quiz.schema';
import { createQuizDto } from 'src/quizzes/dto/createQuiz.dto';
import { updateQuizDto } from 'src/quizzes/dto/updateQuiz.dto';
import mongoose from 'mongoose';

@Injectable()
export class QuizService { 
  constructor(
    @InjectModel(Quiz.name) private quizModel: mongoose.Model<Quiz>
  ) {}

  // create a quiz
  async create(quizData: createQuizDto): Promise<Quiz> {
    const newQuiz = new this.quizModel(quizData); // Use DTO for quiz creation
    return await newQuiz.save(); // Save it to the database
  }

  // Get all quizzes
  async findAll(): Promise<Quiz[]> {
    let quizzes = await this.quizModel.find();  // Fetch all quizzes from the database
    return quizzes
  }

  // Get a quiz by ID
  async findById(quiz_id: mongoose.Types.ObjectId): Promise<Quiz> {
    return await this.quizModel.findById(quiz_id);  // Fetch a quiz by ID
  }

  // Update a quiz's details by ID
  async update(quiz_id: mongoose.Types.ObjectId, updateData: updateQuizDto): Promise<Quiz> {
    return await this.quizModel.findByIdAndUpdate(quiz_id, updateData, { new: true });  // Find and update the quiz
  } 

  // Delete a quiz by ID
  async delete(quiz_id: mongoose.Types.ObjectId): Promise<Quiz> {
    return await this.quizModel.findByIdAndDelete(quiz_id);  // Find and delete the quiz
  }

}