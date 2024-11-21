import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Quiz, QuizDocument } from 'src/schemas/quiz.schema'
import { CreateQuizDto, UpdateQuizDto } from './dto/quizzes.dto'
import { Course } from 'src/schemas/course.schema'
import { User } from 'src/schemas/user.schema'

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(courseId: string, createQuizDto: CreateQuizDto): Promise<Quiz> {
    const course = await this.courseModel.findById(courseId)
    if (!course) {
      throw new NotFoundException('Course not found.')
    }

   
    const existingQuiz = await this.quizModel.findOne({ quiz_id: createQuizDto.quiz_id })
    if (existingQuiz) {
      throw new ConflictException('Quiz ID already exists.')
    }

    const quiz = new this.quizModel({
      ...createQuizDto,
      course_id: courseId, 
    })
    return quiz.save()
  }

  async findOne(quizId: string): Promise<Quiz> {
    const quiz = await this.quizModel.findOne({ quiz_id: quizId }).populate('course_id')
    if (!quiz) {
      throw new NotFoundException('Quiz not found.')
    }
    return quiz
  }

  async update(quizId: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const updatedQuiz = await this.quizModel
      .findOneAndUpdate({ quiz_id: quizId }, updateQuizDto, { new: true })
      .exec()
    if (!updatedQuiz) {
      throw new NotFoundException('Quiz not found.')
    }
    return updatedQuiz
  }

  async delete(quizId: string): Promise<void> {
    const result = await this.quizModel.findOneAndDelete({ quiz_id: quizId }).exec()
    if (!result) {
      throw new NotFoundException('Quiz not found.')
    }
  }
}
