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


@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Response.name) private responseModel: Model<ResponseDocument>,
    @InjectModel(Quiz.name) private QuizModel: Model<QuizDocument>,
    @InjectModel(UserInteraction.name) private userInteractionModel: Model<UserInteractionDocument>,
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
        completionPercentage: progress?.completionPercentage ?? 0,
      };
    }));

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

  async getCourseAnalytics(course_id: string,user_role:string): Promise<{ downloadLink: string }> {
    if(user_role!="instructor"){
      throw new NotFoundException(`User is not an instructor`);
    }
    
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