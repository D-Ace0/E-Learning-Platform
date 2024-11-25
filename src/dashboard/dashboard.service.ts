import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Course, CourseDocument } from '../schemas/courses.schema';
import { Progress, ProgressDocument } from '../schemas/progress.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { ResponseDocument,Response } from '../schemas/response.schema';
import { Module, ModuleDocument } from '../schemas/module.schema';
import { Quiz, QuizDocument } from '../schemas/quiz.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Response.name) private responseModel: Model<ResponseDocument>,
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>
  ) {}

  async getStudentDashboard(user_id: string): Promise<{
    name: string;
    courses: { course: any; completionPercentage: number; averageScore: number }[];
  }> {
    // Fetch the user
    const user = await this.userModel
      .findOne({ _id: user_id })
      .select('name')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    // Fetch all courses
    const courses = await this.courseModel.find().exec();

    // Fetch dashboard data for each course
    const dashboardData = await Promise.all(
      courses.map(async (course) => {
        // Get completion percentage from the Progress collection
        const progress = await this.progressModel
          .findOne({ course_id: course._id, user_id: user_id })
          .select('completionPercentage')
          .lean()
          .exec();
        //const modules=await this.moduleModel.find().exec();

        const module=await this.moduleModel.find({ course_id: course._id}).exec();
        const quiz=await this.quizModel.find({module_id: module[0]._id}).exec();

        // Get average score from the Response collection
        const responses = await this.responseModel
          .find({ quiz_id:quiz[0]._id, user_id: user_id }) // Assumes course has quiz_ids
          .select('score')
          .lean()
          .exec();

        const averageScore =
          responses.length > 0
            ? responses.reduce((sum, response) => sum + response.score, 0) /
            responses.length
            : 0;

        return {
          course,
          completionPercentage: progress?.completionPercentage ?? 0,
          averageScore,
        };
      }),
    );

    return {
      name: user.name,
      courses: dashboardData,
    };
  }


}