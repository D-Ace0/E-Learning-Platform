import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {Course,CourseDocument} from '../schemas/courses.schema';
import { Progress, ProgressDocument } from '../schemas/progress.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { ResponseDocument } from '../schemas/response.schema';
import { Quiz, QuizDocument } from '../schemas/quiz.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Response.name) private responseModel: Model<ResponseDocument>,
    @InjectModel(Quiz.name) private QuizModel: Model<QuizDocument>,
  ) {}

  async getStudentDashboard(user_id: string): Promise<{
    name: string;
    courses: { course: any; completionPercentage: number }[];
  }> {
    // Fetch user details with courses
    const user = await this.userModel
      .findOne({ _id: user_id })
      .select('name courses')
      .populate({
        path: 'courses', // Populate course details
        model: 'Course',
      })
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    // Ensure courses are present
    const courses = user.courses || [];

    // Fetch progress for each course
    const dashboardData = await Promise.all(
      courses.map(async (course: any) => {
        const progress = await this.progressModel
          .findOne({ course_id: course._id, user_id }) // Match user and course
          .select('completionPercentage')
          .lean()
          .exec();

        return {
          course,
          completionPercentage: progress?.completionPercentage ?? 0, // Default to 0 if no progress
        };
      })
    );

    return {
      name: user.name,
      courses: dashboardData,
    };
  }
  //
  async getUserAverageScore(user_id: string, course_id: string): Promise<number> {
    // Fetch all quizzes for the given course
    const quizzes = await this.QuizModel
      .find({ course_id })
      .select('_id')
      .lean()
      .exec();

    if (!quizzes.length) {
      throw new NotFoundException(`No quizzes found for course ID ${course_id}`);
    }

    const quizIds = quizzes.map((quiz) => quiz._id);

    // Fetch all responses for the user and quizzes in the course
    const responses = await this.responseModel
      .find({
        user_id,
        quiz_id: { $in: quizIds },
      })
      .select('score')
      .lean()
      .exec();

    if (!responses.length) {
      throw new NotFoundException(`No responses found for user ID ${user_id} in course ID ${course_id}`);
    }

    // Calculate the average score
    const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
    const averageScore = totalScore / responses.length;

    return averageScore;
  }

}