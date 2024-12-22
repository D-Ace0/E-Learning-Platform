import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Mongoose } from 'mongoose';
import { Quiz } from 'src/schemas/quiz.schema';
import { Question } from 'src/schemas/question.schema';
import { QuizPerformance } from 'src/schemas/quiz_performance.schmea';
import { createQuizDto } from 'src/quizzes/dto/createQuiz.dto';
import { updateQuizDto } from 'src/quizzes/dto/updateQuiz.dto';
import { response } from 'express';
import { QuizSelection } from 'src/schemas/quizSelection.schema';
import { SubmitQuizDto } from './dto/submitQuiz.dto';

@Injectable()
export class QuizService {

  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(QuizPerformance.name) private performanceModel: Model<QuizPerformance>,
    @InjectModel(QuizSelection.name) private quizSelectionModel: Model<QuizSelection>,
    @InjectModel(Question.name) private questionModel: Model<Question>
  ) {}

  // Create a quiz
  async create(quizData: createQuizDto): Promise<Quiz> {
    const newQuiz = new this.quizModel(quizData);
    return await newQuiz.save();
  }

  // Get all quizzes
  async findAll(): Promise<Quiz[]> {
    return await this.quizModel.find();
  }

  // Get a quiz by ID
  async findById(quiz_id: string): Promise<Quiz> {
    return await this.quizModel.findById(quiz_id);
  }

  // Update a quiz
  async update(quiz_id: mongoose.Types.ObjectId, updateData: updateQuizDto): Promise<Quiz> {
    return await this.quizModel.findByIdAndUpdate(quiz_id, updateData, { new: true });
  }

  // Delete a quiz
  async delete(quiz_id: mongoose.Types.ObjectId): Promise<Quiz> {
    return await this.quizModel.findByIdAndDelete(quiz_id);
  }


  async getQuizQuestions(quizId: string, student_id: string) {
    // Check for an existing quiz selection by the student
    const existingQuizSelection = await this.quizSelectionModel.findOne({ quiz_id: quizId, student_id: student_id });
  
    if (existingQuizSelection) {
      // Fetch questions using the existing selection
      const questions = await this.questionModel.find({ _id: { $in: existingQuizSelection.questions } });
  
      // Return the questions in the desired format
      return questions.map((question) => ({
        questionId: question._id,
        questionText: question.question,
      }));
    }
  
    // Determine difficulty based on the user's previous performance
    const lastPerformance = await this.performanceModel.findOne({ quiz_id: quizId, student_id: student_id });
    let difficultyLevel: string | null = null;
    if (lastPerformance) {
      const score = lastPerformance.score;
      if (score < 50) {
        difficultyLevel = 'easy';
      } else if (score >= 50 && score < 74) {
        difficultyLevel = 'medium';
      } else if (score >= 74) {
        difficultyLevel = 'hard';
      }
    }
  
    // Fetch questions based on difficulty or default to all questions
    const questions = difficultyLevel
      ? await this.questionModel.find({ difficulty: difficultyLevel })
      : await this.questionModel.find({});
  
    // Select two-thirds of the questions
    const oneThirds = Math.floor((1 / 3) * questions.length);
    const selectedQuestionsArray = questions.slice(0, oneThirds);
  
    const selectedQuestionsWithDetails = selectedQuestionsArray.map((question) => ({
      questionId: question._id,
      questionText: question.question,
    }));
  
    const selectedQuestionIds = selectedQuestionsWithDetails.map((q) => q.questionId);
  
    // Create a new quiz selection for the student
    const newQuizSelections = new this.quizSelectionModel({
      student_id: student_id,
      quiz_id: quizId,
      questions: selectedQuestionIds,
    });
  
    await newQuizSelections.save();
  
    // Update the quiz with the selected questions, avoiding duplicates
    await this.quizModel.updateOne(
      { _id: quizId },
      { $addToSet: { questions: { $each: selectedQuestionIds } } } // Use $addToSet to prevent duplication
    );
  
    return selectedQuestionsWithDetails;
  }
  
  

  async submitQuiz(
    studentId: string,
    quizId: string,
    submittedAnswers: { questionId: string; answer: string }[]
  ) {
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }
  
    const alreadySubmitted = await this.performanceModel.findOne({
      quiz_id: quizId,
      student_id: studentId,
    });
    if (alreadySubmitted) {
      await this.performanceModel.findOneAndDelete(alreadySubmitted._id);
    }
  
    const questionIds = quiz.questions; // Assuming this contains ObjectIds of questions
    const questions = await this.questionModel.find({ _id: { $in: questionIds } });
  
    // Create a map of questionId -> correct answer
    const correctAnswersMap = new Map(
      questions.map((q) => [q._id.toString(), q.answer])
    );
  
    // Compare submitted answers with correct answers and calculate the score
    let correctCount = 0;
    const feedback = submittedAnswers.map(({ questionId, answer }) => {
      const correctAnswer = correctAnswersMap.get(questionId);
      const isCorrect = correctAnswer.toLowerCase() === answer.toLowerCase();
  
      if (isCorrect) correctCount++;
  
      return {
        questionId,
        submittedAnswer: answer,
        correctAnswer,
        isCorrect,
      };
    });
  
    const totalQuestions = questionIds.length;
    const scorePercentage = (correctCount / totalQuestions) * 100;
  
    // Determine the message based on the score
    let message = "";
    if (scorePercentage < 50) {
      message = "You failed, retake the quiz.";
    } else if (scorePercentage === 50) {
      message = "Passed. Barely made it!";
    } else if (scorePercentage <= 75) {
      message = "Good job! Keep improving.";
    } else if (scorePercentage <= 90) {
      message = "Great work! You're close to perfection.";
    } else {
      message = "Excellent! You nailed it!";
    }
  
    // Save the performance record in the database
    const newPerformance = new this.performanceModel({
      quiz_id: quizId,
      student_id: studentId,
      score: scorePercentage,
      answers: submittedAnswers.map((a) => a.answer),
      attempted_at: new Date(),
    });
  
    await newPerformance.save();
  
    return {
      message,
      scorePercentage,
      feedback, // Includes detailed feedback for each question
    };
  }
  
  
  
  
  
}
