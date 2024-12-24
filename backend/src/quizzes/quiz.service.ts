import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
import { Course } from 'src/schemas/course.schema';
import { Module } from 'src/schemas/module.schema';
import { Response } from 'src/schemas/response.schema';
import { UserInteraction } from 'src/schemas/user_interaction';

@Injectable()
export class QuizService {

  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(QuizPerformance.name) private performanceModel: Model<QuizPerformance>,
    @InjectModel(QuizSelection.name) private quizSelectionModel: Model<QuizSelection>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Module.name) private moduleModel: Model<Module>,
    @InjectModel(Response.name) private responseModel: Model<Response>,
    @InjectModel(UserInteraction.name) private userInteraction: Model<UserInteraction>,
  ) {}


  async findByModuleId(module_id: string) {
    return await this.quizModel.find({ module_id });
  }




  async create(quizData: createQuizDto, instructorId: string): Promise<Quiz> {
    const module = await this.moduleModel.findById(quizData.module_id);
    if (!module) {
      throw new ForbiddenException('Module not found');
    }
  
    const course = await this.courseModel.findById(module.course_id);
    if (!course) {
      throw new ForbiddenException('Course not found for this module');
    }
  
    if (course.created_by.toString() !== instructorId) {
      throw new ForbiddenException('You are not authorized to create a quiz for this module');
    }
  
    // Fetch questions based on type and count
    const { questionCount, questionType } = quizData;
    const questions = await this.questionModel.find({ type: questionType }).limit(questionCount);
  
    if (questions.length < questionCount) {
      throw new Error('Not enough questions available of the specified type');
    }
  
    // Create new quiz
    const newQuiz = new this.quizModel({
      module_id: quizData.module_id,
      questions: questions.map((q) => q._id),
      questionCount,
      questionType,
      created_at: new Date(),
    });
  
    return await newQuiz.save();
  }
  
  

  // Get all quizzes
  async findAll(): Promise<Quiz[]> {
    return await this.quizModel.find();
  }

  // Get a quiz by ID
  async findById(quiz_id: string) {
    return await this.quizModel.findById(quiz_id);
  }

  async update(
    quiz_id: string,
    quizData: updateQuizDto,
    instructorId: string
  ): Promise<Quiz> {
    // Find the quiz
    const quiz = await this.quizModel.findById(quiz_id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
  
    // Find the module associated with the quiz
    const module = await this.moduleModel.findById(quiz.module_id);
    if (!module) {
      throw new NotFoundException('Module not found');
    }
  
    // Find the course associated with the module
    const course = await this.courseModel.findById(module.course_id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
  
    // Check if the instructor is authorized to edit the quiz
    if (course.created_by.toString() !== instructorId) {
      throw new ForbiddenException('You are not authorized to update this quiz');
    }
  
    // Check if any students have already initiated the quiz
    const quizTaken = await this.responseModel.find({ quiz_id });
    const quizTaken2 = await this.quizSelectionModel.find({ quiz_id });
    console.log(quizTaken)
    console.log(quizTaken2)
    if (quizTaken.length > 0 || quizTaken2.length > 0) {
      throw new ForbiddenException(
        'Quiz cannot be edited as students have already initiated taking it'
      );
    }
    
    // Fetch questions based on the updated type and count
    const { questionCount, questionType } = quizData;
    const questions = await this.questionModel.find({ type: questionType }).limit(questionCount);
  
    if (questions.length < questionCount) {
      throw new Error('Not enough questions available of the specified type');
    }
  
    // Update the quiz
    const updatedQuiz = await this.quizModel.findByIdAndUpdate(
      quiz_id,
      {
        questions: questions.map((q) => q._id),
        ...quizData,
      },
      { new: true }
    );
  
    return updatedQuiz;
  }
  


  async delete(
    quiz_id: string,
    instructorId: string
  ): Promise<{ message: string }> {
    const quiz = await this.quizModel.findById(quiz_id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
  
    // Find the module associated with the quiz
    const module = await this.moduleModel.findById(quiz.module_id);
    if (!module) {
      throw new NotFoundException('Module not found');
    }
  
    // Find the course associated with the module
    const course = await this.courseModel.findById(module.course_id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
  
    // Check if the instructor is authorized to delete the quiz
    if (course.created_by.toString() !== instructorId) {
      throw new ForbiddenException('You are not authorized to delete this quiz');
    }
  
    // Check if any students have already initiated the quiz
    const quizTaken = await this.responseModel.find({ quiz_id });
    const quizTaken2 = await this.quizSelectionModel.find({ quiz_id });
  
    if (quizTaken.length > 0 || quizTaken2.length > 0) {
      throw new ForbiddenException(
        'Quiz cannot be deleted as students have already initiated taking it'
      );
    }
  
    // Delete the quiz
    await this.quizModel.findByIdAndDelete(quiz_id);
  
    return { message: 'Quiz deleted successfully' };
  }
  


async getQuizzesByRole(userId: string, role: 'student' | 'instructor') {
  if (role === 'student') {
    // Find all courses the student is enrolled in
    const enrolledCourses = await this.courseModel.find({ enrolledStudents: userId });
    const enrolledCourseIds = enrolledCourses.map((course) => course._id);

    // Find all modules in these courses
    const modules = await this.moduleModel.find({ course_id: { $in: enrolledCourseIds } });
    const moduleIds = modules.map((module) => module._id);

    // Find all quizzes in these modules
    const quizzes = await this.quizModel.find({ module_id: { $in: moduleIds } });
    return quizzes;
  }

  if (role === 'instructor') {
    // Find all courses created by the instructor
    const instructorCourses = await this.courseModel.find({ created_by: userId });
    const instructorCourseIds = instructorCourses.map((course) => course._id);

    // Find all modules in these courses
    const modules = await this.moduleModel.find({ course_id: { $in: instructorCourseIds } });
    const moduleIds = modules.map((module) => module._id);

    // Find all quizzes in these modules
    const quizzes = await this.quizModel.find({ module_id: { $in: moduleIds } });
    return quizzes;
  }

  throw new ForbiddenException('Invalid role');
}



async getQuizQuestions(quizId: string, student_id: string) {
  const quiz = await this.quizModel.findById(quizId);
  if (!quiz) {
    throw new NotFoundException('Quiz not found');
  }

  const existingQuizSelection = await this.quizSelectionModel.findOne({
    quiz_id: quizId,
    student_id,
  });

  if (existingQuizSelection) {
    const questions = await this.questionModel.find({
      _id: { $in: existingQuizSelection.questions },
    });

    return questions.map((question) => ({
      questionId: question._id,
      questionText: question.question,
      type: question.type,
      options: question.options || null, // Include options for MCQs
    }));
  }

  // Fetch questions based on difficulty and type
  const lastPerformance = await this.performanceModel.findOne({
    quiz_id: quizId,
    student_id,
  });

  let difficultyLevel: string | null = null;
  if (lastPerformance) {
    const score = lastPerformance.score;
    if (score < 50) difficultyLevel = 'easy';
    else if (score >= 50 && score < 74) difficultyLevel = 'medium';
    else difficultyLevel = 'hard';
  }

  const { questionCount, questionType } = quiz;
  console.log(`Fetching questions with type: ${questionType}, difficulty: ${difficultyLevel}, ${questionCount}`);

  // Fetch questions based on type and optional difficulty
  const questionFilter: any = { type: questionType };
  if (difficultyLevel) {
    questionFilter.difficulty = difficultyLevel;
  }

  const questions = await this.questionModel.find(questionFilter).limit(questionCount);

  if (questions.length === 0) {
    console.error('No questions found with the specified filters');
    throw new NotFoundException('No questions available for this quiz');
  }

  console.log(`Fetched questions: ${questions.map(q => q._id)}`);

  const selectedQuestions = questions.map((question) => ({
    questionId: question._id,
    questionText: question.question,
    type: question.type,
    options: question.options || null,
  }));

  // Save selected questions for the student
  const selectedQuestionIds = questions.map((q) => q._id); // Correct mapping for IDs

  const newQuizSelection = new this.quizSelectionModel({
    student_id,
    quiz_id: quizId,
    questions: selectedQuestionIds,
  });

  await newQuizSelection.save();

  // Update the quiz with the selected questions, avoiding duplicates
  await this.quizModel.updateOne(
    { _id: quizId },
    { $addToSet: { questions: { $each: selectedQuestionIds } } } // Use $addToSet to prevent duplication
  );

  return selectedQuestions;
}


  
  

async submitQuiz(
  studentId: string,
  quizId: string,
  submittedAnswers: { questionId: string; answer: string }[],
) {
  const quiz = await this.quizModel.findById(quizId);
  if (!quiz) {
    throw new NotFoundException('Quiz not found');
  }

  const questionIds = quiz.questions;
  const questions = await this.questionModel.find({ _id: { $in: questionIds } });

  const correctAnswersMap = new Map(
    questions.map((q) => [q._id.toString(), q.answer])
  );

  let correctCount = 0;
  const feedback = submittedAnswers.map(({ questionId, answer }) => {
    const correctAnswer = correctAnswersMap.get(questionId);
    const isCorrect = correctAnswer === answer;

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

  // Original message logic
  let message = '';
  if (scorePercentage < 50) {
    message = 'You failed, retake the quiz.';
  } else if (scorePercentage === 50) {
    message = 'Passed. Barely made it!';
  } else if (scorePercentage <= 75) {
    message = 'Good job! Keep improving.';
  } else if (scorePercentage <= 90) {
    message = 'Great work! You\'re close to perfection.';
  } else {
    message = 'Excellent! You nailed it!';
  }

  const newPerformance = new this.performanceModel({
    quiz_id: quizId,
    student_id: studentId,
    score: scorePercentage,
    answers: submittedAnswers.map((a) => a.answer),
    attempted_at: new Date(),
  });

  await newPerformance.save();

  const newResponse = new this.responseModel({
    user_id: studentId,
    quiz_id: quizId,
    answers: submittedAnswers,
    score: scorePercentage,
    submitted_at: Date.now()
  })
  await newResponse.save()


  const moduleId = (await this.quizModel.findById(quizId)).module_id
  const courseId = (await this.moduleModel.findById(moduleId)).course_id
  const newInteraction = new this.userInteraction({
    user_id: studentId,
    course_id: courseId,
    response_id: newResponse._id
  })
  await newInteraction.save()



  await this.quizSelectionModel.findOneAndDelete({quiz_id: quizId})

    await this.quizModel.updateOne(
      { _id: quizId },
      { $set: { questions: [] } } // Clears the questions array
    );

  return {
    message,
    scorePercentage,
    feedback,
  };
}
  
}
