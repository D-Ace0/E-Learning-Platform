import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Course, CourseDocument } from '../schemas/course.schema';
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

        const {Thread, parentVersion, created_by, enrolledStudents, ...restOFCoure} = course

        return {
          course: restOFCoure,
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

  // for Instructor
  async getCourseAnalytics(user_id: string): Promise<{ downloadLink: string, AverageQuizScores: any, AllGrades: any }> {
    // Fetch user interactions for the given user_id
    const interactions = await this.userInteractionModel.find({ user_id:user_id }).lean().exec();
    if (!interactions) {
        throw new NotFoundException(`No interactions found for user ID ${user_id}`);
    }

    // Get all course IDs from the interactions
    const courseIds = [...new Set(interactions.map(interaction => interaction.course_id))];

    // Fetch course details for the courses the user interacted with
    const courses = await this.courseModel.find({ _id: { $in: courseIds } }).select('title').lean().exec();
    if (!courses) {
        throw new NotFoundException(`No courses found for user ID ${user_id}`);
    }

    // Get all quiz responses for the courses
    const quizzes = await this.QuizModel.find({ course_id: { $in: courseIds } }).select('_id').lean().exec();
    const quizResponses = await this.responseModel.find({ quiz_id: { $in: quizzes.map(q => q._id) } }).select('-answers').exec();

    // Calculate the average quiz score for all students in these courses
    const totalQuizScore = quizResponses.reduce((sum, response) => sum + response.score, 0);
    const averageQuizScore = quizResponses.length > 0 ? totalQuizScore / quizResponses.length : 0;

    // Calculate total score and total time spent from interactions
    const totalScore = await this.calculateTotalScore(interactions as UserInteractionDocument[]);
    const totalTimeSpent = interactions.reduce((sum, interaction) => sum + interaction.time_spent_minutes, 0);
    const averageScore = totalScore / interactions.length;
    const averageTimeSpent = totalTimeSpent / interactions.length;

    // Prepare CSV writer
    const csvWriter = createObjectCsvWriter({
        path: join(__dirname, `course_analytics_${user_id}.csv`),
        header: [
            { id: 'user_id', title: 'User ID' },
            { id: 'average_score', title: 'Average Score' },
            { id: 'average_time_spent', title: 'Average Time Spent (minutes)' },
            { id: 'average_quiz_score', title: 'Average Quiz Score' },
        ],
    });

    // Records to be written to the CSV
    const records = [
        {
            user_id: user_id,
            average_score: averageScore,
            average_time_spent: averageTimeSpent,
            average_quiz_score: averageQuizScore,
        },
    ];

    // Write to CSV
    await csvWriter.writeRecords(records);

    // Path to the generated CSV file
    const filePath = join(__dirname, `course_analytics_${user_id}.csv`);

    // Return the download link and record details
    return { downloadLink: filePath, AverageQuizScores: averageQuizScore, AllGrades: [quizResponses] };
  }

  async calculateTotalScore(interactions: UserInteractionDocument[]) {
      const responses = await this.responseModel.find({ _id: { $in: interactions.map(i => i.response_id) } });

      const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
      return totalScore;
    }


  async getCourseForStudentAnalytics(

    courseId: string,
    user_id: string,
  ): Promise<{ AverageQuizScores: number; AllGrades: any[],ProgressPercent:any }> {
    // Step 1: Find user interactions for the specified course
    const interactionResponses = await this.userInteractionModel
      .find({ user_id: user_id,course_id: courseId })
      .select("response_id")
      .lean()
      .exec();

    if (!interactionResponses || interactionResponses.length === 0) {
      throw new NotFoundException(`No interactions found for user ID ${user_id} and course ${courseId}`);
    }

    // Extract response IDs
    const responseIds = interactionResponses.map((interaction) => interaction.response_id);

    // Step 2: Fetch the scores for the responses
    const responses = await this.responseModel
      .find({ _id: { $in: responseIds } })
      .select("score")
      .lean()
      .exec();

    if (!responses || responses.length === 0) {
      throw new NotFoundException(`No response scores found for the interactions.`);
    }

    // Step 3: Calculate the average quiz scores
    const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
    const averageScore = totalScore / responses.length;

    // Step 4: Prepare a list of all grades
    const allGrades = responses.map((response) => ({ id: response._id, score: response.score }));

    // Step 5: Generate a download link for analytics (dummy link for now)

    const progress= await this.progressModel.find({user_id:user_id,course_id:courseId}).select("completionPercentage");
    // Step 6: Return the data
    return {

      AverageQuizScores: averageScore,
      AllGrades: allGrades,
      ProgressPercent: progress,

    };
  }


}