import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Course, CourseDocument } from '../schemas/courses.schema';
import { Progress, ProgressDocument } from '../schemas/progress.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { ResponseDocument } from '../schemas/response.schema';
import { Quiz, QuizDocument } from '../schemas/quiz.schema';
import { UserInteraction, UserInteractionDocument } from '../schemas/user_interaction';
import { createObjectCsvWriter } from 'csv-writer';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Module, ModuleDocument } from '../schemas/module.schema';


@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Response.name) private responseModel: Model<ResponseDocument>,
    @InjectModel(Quiz.name) private QuizModel: Model<QuizDocument>,
    @InjectModel(UserInteraction.name) private userInteractionModel: Model<UserInteractionDocument>,
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
  ) {}

  async getStudentDashboard(user_id: string): Promise<{
    name: string;
    courses: { course: any; completionPercentage: number; averageScore: number }[];
  }> {
    // Fetch user details with courses
    const user = await this.userModel
      .findOne({ _id: user_id })
      .select('name courses')
      .populate({
        path: 'courses',
        model: 'Course',
      })
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const courses = user.courses || [];

    // Fetch progress and calculate average score for each course
    const dashboardData = await Promise.all(
      courses.map(async (course: any) => {
        // Get progress
        const progress = await this.progressModel
          .findOne({ course_id: course._id, user_id })
          .select('completionPercentage')
          .lean()
          .exec();

        // Get all modules for this course
        const modules = await this.moduleModel
          .find({ course_id: course._id })
          .select('_id')
          .lean()
          .exec();

        // Get all quizzes for these modules
        const moduleIds = modules.map(m => m._id);
        const quizzes = await this.QuizModel
          .find({ module_id: { $in: moduleIds } })
          .select('_id')
          .lean()
          .exec();

        // Get all responses for these quizzes
        const quizIds = quizzes.map(q => q._id);
        const responses = await this.responseModel
          .find({
            quiz_id: { $in: quizIds },
            user_id: user_id
          })
          .select('score')
          .lean()
          .exec();

        // Calculate average score
        const averageScore = responses.length > 0
          ? responses.reduce((sum, response) => sum + response.score, 0) / responses.length
          : 0;

        return {
          course,
          completionPercentage: progress?.completionPercentage ?? 0,
          averageScore,
        };
      })
    );

    return {
      name: user.name,
      courses: dashboardData,
    };
  }



  // for Instructor
  async getCourseAnalytics(course_id: string): Promise<{ downloadLink: string }> {
    // Trim any extra whitespace or newline characters
    course_id = course_id.trim();

    const interactions = await this.userInteractionModel.find({ course_id }).lean().exec();
    if (!interactions.length) {
      throw new NotFoundException(`No interactions found for course ID ${course_id}`);
    }

    const course = await this.courseModel.findById(course_id).select('name').lean().exec();
    if (!course) {
      throw new NotFoundException(`Course not found for course ID ${course_id}`);
    }

    // Calculate total score and total time spent
    const totalScore = interactions.reduce((sum, interaction) => sum + interaction.score, 0);
    const totalTimeSpent = interactions.reduce((sum, interaction) => sum + interaction.time_spent_minutes, 0);
    const averageScore = totalScore / interactions.length;
    const averageTimeSpent = totalTimeSpent / interactions.length;

    const csvWriter = createObjectCsvWriter({
      path: join(__dirname, `course_analytics_${course_id}.csv`),
      header: [
        { id: 'course_id', title: 'Course ID' },
        { id: 'course_name', title: 'Course Name' },
        { id: 'average_score', title: 'Average Score' },
        { id: 'average_time_spent', title: 'Average Time Spent (minutes)' },
      ],
    });

    const records = [
      {
        course_id: course_id,
        course_name: course.title,
        average_score: averageScore,
        average_time_spent: averageTimeSpent,
      },
    ];

    await csvWriter.writeRecords(records);

    const filePath = join(__dirname, `course_analytics_${course_id}.csv`);
    return { downloadLink: filePath };
  }

}