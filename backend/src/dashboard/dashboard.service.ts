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

  async getStudentDashboard(user_id: string): Promise<{ AverageQuizScores: number; AllGrades: any[], ProgressPercent: any, interaction: any, courseTitles: any }> {
    // Fetch user interactions
    const user = await this.userInteractionModel.find({ user_id: user_id }).lean().exec();
    if (!user) throw new NotFoundException('User not found');
    console.log('User Interactions:', user);

    // Extract response IDs
    const responseIds = user.map((interaction) => interaction.response_id);

    const responses = await this.responseModel.find({ _id: { $in: responseIds } }).select("score").lean().exec();
    if (!responses || responses.length === 0) {
      throw new NotFoundException(`No response scores found for the interactions.`);
    }

    const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
    const averageScore = totalScore / responses.length;
    const allGrades = responses.map((response) => ({ id: response._id, score: response.score }));

    // Fetch progress
    const progress = await this.progressModel.find({ user_id: user_id }).select("completionPercentage course_id").lean().exec();
    console.log('Progress Data:', progress);

    // Fetch course titles
    const courseIds = user.map((interaction) => interaction.course_id);
    console.log('Course IDs:', courseIds);

    const courses = await this.courseModel.find({ _id: { $in: courseIds } }).select("title").lean().exec();
    console.log('Courses:', courses);

    const courseTitles = courses.reduce((acc, course) => {
      acc[course._id.toString()] = course.title; // Ensure consistent string format
      return acc;
    }, {});
    console.log('Course Titles:', courseTitles);

    return {
      AverageQuizScores: averageScore,
      AllGrades: allGrades,
      ProgressPercent: progress,
      interaction: user,
      courseTitles: courseTitles,
    };
  }



  // for Instructor

  // for Instructor
  async getCourseAnalytics(courseID: string): Promise<{ downloadLink: string, AverageQuizScores: any, AllGrades: any }> {
    // Fetch user interactions for the given user_id
    const interactions = await this.userInteractionModel.find({ course_id:courseID }).lean().exec();
    if (!interactions) {
        throw new NotFoundException(`No interactions found for course ID ${courseID}`);
    }


    // Get all course IDs from the interactions


    // Get all quiz responses for the courses
    const quizzes = await this.QuizModel.find({ course_id: courseID }).lean().exec();
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
        path: join(__dirname, `course_analytics_${courseID}.csv`),
        header: [
            { id: 'courseID', title: 'course ID' },
            { id: 'average_score', title: 'Average Score' },
            { id: 'average_time_spent', title: 'Average Time Spent (minutes)' },
            { id: 'average_quiz_score', title: 'Average Quiz Score' },
          { id: 'quiz_score', title: ' Quiz Score' },
        ],
    });

    // Records to be written to the CSV
    const records = [
        {
          courseID: courseID,
            average_score: averageScore,
            average_time_spent: averageTimeSpent,
            average_quiz_score: quizResponses,
        },
    ];

    // Write to CSV
    await csvWriter.writeRecords(records);

    // Path to the generated CSV file
    const filePath = join(__dirname, `course_analytics_${courseID}.csv`);

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