import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
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
    @InjectModel(QuizSelection.name) private quizSelectionModel: Model<QuizSelection>
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

  

  // Helper methods ------------------------------------------------

  async selectQuestionsBasedOnPerformance(quizId: string, previousScore: number) {
    const quiz = await this.quizModel.findById(quizId).populate('questions').exec(); // Populate questions
    const easyQuestions = quiz.questions.filter(q => q.difficulty === 'easy');
    const mediumQuestions = quiz.questions.filter(q => q.difficulty === 'medium');
    const hardQuestions = quiz.questions.filter(q => q.difficulty === 'hard');
    let res = []
    let selectedQuestions = [];
    if (previousScore >= 80) {
      selectedQuestions = this.randomizeQuestions(hardQuestions);
    } else if (previousScore >= 50) {
      selectedQuestions = this.randomizeQuestions(mediumQuestions);
    } else {
      selectedQuestions = this.randomizeQuestions(easyQuestions);
    }

    selectedQuestions.forEach((q) => res.push(q.question))
    return selectedQuestions
  }

  randomizeQuestions(questions: Question[]): Question[] {
    const shuffled = questions.sort(() => Math.random() - 0.5); // Shuffle the questions
    const oneThirdLength = Math.ceil(questions.length / 3); // Calculate one-third of the array length
    return shuffled.slice(0, oneThirdLength); // Return the first one-third of the shuffled array
  }
  
  

  async getQuestions(studentId: string, quizId: string){
   
    let res: string[] = []
    const quiz = await this.quizModel.findById(quizId).populate('questions').exec(); // Populate questions

    let selectedQuestions: Question[];
    selectedQuestions = this.randomizeQuestions(quiz.questions);

    const newQuizSelection = new this.quizSelectionModel({
      student_id: studentId,
      quiz_id: quizId,
      questions: selectedQuestions,
    });

    await newQuizSelection.save()

    selectedQuestions.forEach((q) => res.push(q.question))
    return res
  }
  // Helper methods  ------------------------------------------------



  // Submit the quiz and generate a new randomized set of questions
  async submitQuiz(studentId: string, quizId: string, answers: SubmitQuizDto) {
    let Questions_If_No_Answers: string[] = []
    let selectedQuestions= []

    const storedSelection = await this.quizSelectionModel.findOne({ student_id: studentId, quiz_id: quizId }).populate('questions').exec();

    if(storedSelection){

      const previousPerformance = await this.performanceModel.findOne({ student_id: studentId, quiz_id: quizId }).exec();

      if(previousPerformance){
        await this.quizSelectionModel.findOneAndDelete({student_id: studentId, quiz_id: quizId})
        selectedQuestions = await this.selectQuestionsBasedOnPerformance(quizId, previousPerformance.score)
        const newStoredSelection = new this.quizSelectionModel({
          student_id: studentId,
          quiz_id: quizId,
          questions: selectedQuestions
        })
        await newStoredSelection.save()
        selectedQuestions.map((q) => Questions_If_No_Answers.push(q.question))
        await this.performanceModel.findOneAndDelete({student_id: studentId, quiz_id: quizId})

      }else{
        selectedQuestions = storedSelection.questions
        Questions_If_No_Answers = selectedQuestions.map((q) => q.question);
      }

    } else{
      selectedQuestions = await this.getQuestions(studentId, quizId)
      Questions_If_No_Answers = selectedQuestions
    }

   if(!answers || answers.answers.length === 0) {
    return Questions_If_No_Answers
   }

    const studentId_as_objectID = new mongoose.Types.ObjectId(studentId)
    const quizId_as_objectID = new mongoose.Types.ObjectId(quizId)


    let correctAnswers=0
    answers.answers.forEach((ans) => {
      storedSelection.questions.forEach((q) => {
        if(ans === q.answer)
          correctAnswers++
      })
    })
    const score = correctAnswers / storedSelection.questions.length * 100

    // Store the quiz performance
    const newQuizPerformance = new this.performanceModel({
      student_id: studentId_as_objectID,
      quiz_id: quizId_as_objectID,
      answers: answers.answers,
      score: score,
      attempted_at: new Date(),
    });

    return await newQuizPerformance.save();
  }

}
