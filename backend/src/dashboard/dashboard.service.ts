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


  async getStudentDashboard(user_id: string): Promise<{
    AverageQuizScores: number;
    AllGrades: Array<{ id: any; score: number }>;
    ProgressPercent: Array<{ completionPercentage: number; course_id: string }>;
    interaction: Array<any>;
    courseTitles: Record<string, string>;
  }> {
    const userInteractions = await this.userInteractionModel
        .find({ user_id })
        .lean()
        .exec();

    const responseIds = userInteractions
        .filter((interaction) => interaction.response_id)
        .map((interaction) => interaction.response_id);

    const responses = await this.responseModel
        .find({ _id: { $in: responseIds } })
        .select('score')
        .lean()
        .exec();

    const averageScore = responses.length
        ? responses.reduce((sum, response) => sum + response.score, 0) / responses.length
        : 0;

    const allGrades = responses.map((response) => ({
      id: response._id,
      score: response.score,
    }));

    const progress = await this.progressModel
        .find({ user_id })
        .select('completionPercentage course_id')
        .lean()
        .exec();

    // Convert ObjectId to string for course_id
    const formattedProgress = progress.map(p => ({
        completionPercentage: p.completionPercentage,
        course_id: p.course_id.toString()
    }));

    const courseIds = userInteractions.map((interaction) => interaction.course_id);

    const courses = await this.courseModel
        .find({ _id: { $in: courseIds } })
        .select('title')
        .lean()
        .exec();

    const courseTitles = courses.reduce((acc, course) => {
      acc[course._id.toString()] = course.title;
      return acc;
    }, {});

    return {
      AverageQuizScores: averageScore,
      AllGrades: allGrades,
      ProgressPercent: formattedProgress,
      interaction: userInteractions,
      courseTitles: courseTitles,
    };
  }




  async getCourseAnalytics(courseID: string): Promise<{
    downloadLink: string;
    completedStudentsCount: number;
    performanceCategories: Record<string, number>;
    contentEffectiveness: string;
    allGrades: { userId: string; quizId: string; score: number }[];
  }> {
    const DIST_DIR = join(process.cwd(), 'dist');
    await fs.mkdir(DIST_DIR, { recursive: true });

    // Fetch modules, quizzes, and responses
    const modules = await this.moduleModel.find({ course_id: courseID }).lean().exec();
    const moduleIds = modules.map((module) => module._id);

    const quizzes = await this.QuizModel.find({ module_id: { $in: moduleIds } }).lean().exec();
    const quizIds = quizzes.map((quiz) => quiz._id);

    const quizResponses = await this.responseModel.find({ quiz_id: { $in: quizIds } }).lean().exec();

    // Count completed students
    const completedStudents = await this.progressModel.find({
      course_id: courseID,
      completionPercentage: 100,
    }).lean().exec();
    const completedStudentsCount = completedStudents.length;

    // Map grades
    const allGrades = quizResponses.map((response) => ({
      userId: response.user_id ? response.user_id.toString() : 'Unknown User',
      quizId: response.quiz_id ? response.quiz_id.toString() : 'Unknown Quiz',
      score: response.score ?? 0,
    }));

    // Categorize performance
    const performanceCategories = { 'below average': 0, average: 0, 'above average': 0, excellent: 0 };
    quizResponses.forEach((response) => {
      if (response.score < 50) performanceCategories['below average']++;
      else if (response.score < 70) performanceCategories['average']++;
      else if (response.score < 90) performanceCategories['above average']++;
      else performanceCategories['excellent']++;
    });

    // Determine content effectiveness
    const maxCategoryCount = Math.max(...Object.values(performanceCategories));
    const mostCommonCategories = Object.entries(performanceCategories).filter(([, count]) => count === maxCategoryCount);
    const effectivenessMap = { 'below average': 'Not Effective', average: 'Slightly Effective', 'above average': 'Effective', excellent: 'Highly Effective' };
    const contentEffectiveness = mostCommonCategories.length > 1 ? 'Effective' : effectivenessMap[mostCommonCategories[0][0]];

    // Generate CSV file
    const fileName = `course_analytics_${courseID}.csv`;
    const filePath = join(DIST_DIR, fileName);
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'userId', title: 'User ID' },
        { id: 'quizId', title: 'Quiz ID' },
        { id: 'score', title: 'Score' },
      ],
    });

    await csvWriter.writeRecords(allGrades);

    return {
      downloadLink: filePath,
      completedStudentsCount,
      performanceCategories,
      contentEffectiveness,
      allGrades,
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