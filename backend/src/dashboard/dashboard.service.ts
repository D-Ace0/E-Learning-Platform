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
import { join } from 'path';
import { promises as fs } from 'fs';
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

    // Fetch course titles
    const courseIds = user.map((interaction) => interaction.course_id);

    const courses = await this.courseModel.find({ _id: { $in: courseIds } }).select("title").lean().exec();

    const courseTitles = courses.reduce((acc, course) => {
      acc[course._id.toString()] = course.title; // Ensure consistent string format
      return acc;
    }, {});

    return {
      AverageQuizScores: averageScore,
      AllGrades: allGrades,
      ProgressPercent: progress,
      interaction: user,
      courseTitles: courseTitles,
    };
  }



  async getCourseAnalytics(courseID: string): Promise<{
    downloadLink: string;
    completedStudentsCount: number;
    performanceCategories: Record<string, number>;
    allGrades: any[];
  }> {
    const DIST_DIR = join(process.cwd(), 'dist'); // Create a 'dist' folder for file storage
    await fs.mkdir(DIST_DIR, { recursive: true });

    // Fetch students with 100% completion
    const completedStudents = await this.progressModel
        .find({ course_id: courseID, completionPercentage: 100 })
        .lean()
        .exec();
    const completedStudentsCount = completedStudents.length;

    // Fetch quiz responses and categorize performance
    const quizzes = await this.QuizModel.find({ course_id: courseID }).lean().exec();
    const quizResponses = await this.responseModel
        .find({ quiz_id: { $in: quizzes.map((q) => q._id) } })
        .select('score')
        .lean()
        .exec();

    const allGrades = quizResponses.map((response) => ({ id: response._id, score: response.score }));

    const performanceCategories = {
      'below average': 0,
      average: 0,
      'above average': 0,
      excellent: 0,
    };

    quizResponses.forEach((response) => {
      if (response.score < 50) performanceCategories['below average']++;
      else if (response.score < 70) performanceCategories['average']++;
      else if (response.score < 90) performanceCategories['above average']++;
      else performanceCategories['excellent']++;
    });

    // Generate CSV file
    const fileName = `course_analytics_${courseID}.csv`;
    const filePath = join(DIST_DIR, fileName);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'courseID', title: 'Course ID' },
        { id: 'completedStudentsCount', title: 'Completed Students' },
        { id: 'belowAverage', title: 'Below Average' },
        { id: 'average', title: 'Average' },
        { id: 'aboveAverage', title: 'Above Average' },
        { id: 'excellent', title: 'Excellent' },
      ],
    });

    await csvWriter.writeRecords([
      {
        courseID,
        completedStudentsCount,
        belowAverage: performanceCategories['below average'],
        average: performanceCategories['average'],
        aboveAverage: performanceCategories['above average'],
        excellent: performanceCategories['excellent'],
      },
    ]);

    return {
      downloadLink: filePath, // Return the file path for the front-end
      completedStudentsCount,
      performanceCategories,
      allGrades,
    };
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

  async getInstructorDashboard(instructorId: string): Promise<any> {
    // Fetch courses created by the instructor
    const courses = await this.courseModel.find({ created_by: instructorId }).select('_id title description created_at').lean().exec();

    if (!courses || courses.length === 0) {
      throw new NotFoundException(`No courses found for instructor ID ${instructorId}`);
    }

    // Include course details without analytics for the dashboard
    const instructorCourses = courses.map((course) => ({
      courseId: course._id,
      courseTitle: course.title,
      description: course.description,
      createdAt: course.created_at,
    }));

    return instructorCourses;
  }

}