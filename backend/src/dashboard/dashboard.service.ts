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



  async getCourseAnalytics(courseID: string): Promise<{ downloadLink: string, averageQuizScore: number, allGrades: any[] }> {
    const UPLOAD_DIR = join(process.cwd(), 'uploads'); // Create an 'uploads' folder in the project root

    // Fetch user interactions for the given user_id
    const interactions = await this.userInteractionModel.find({ course_id: courseID }).lean().exec();
    if (!interactions) {
      throw new NotFoundException(`No interactions found for course ID ${courseID}`);
    }

    // Get all quiz responses for the courses
    const quizzes = await this.QuizModel.find({ course_id: courseID }).lean().exec();
    const quizResponses = await this.responseModel.find({ quiz_id: { $in: quizzes.map(q => q._id) } }).select('-answers').exec();

    // Calculate the average quiz score for all students in these courses
    const totalQuizScore = quizResponses.reduce((sum, response) => sum + response.score, 0);
    const averageQuizScore = quizResponses.length > 0 ? totalQuizScore / quizResponses.length : 0;

    // Prepare CSV writer
    const csvWriter = createObjectCsvWriter({
      path: join(__dirname, `course_analytics_${courseID}.csv`),
      header: [
        { id: 'courseID', title: 'Course ID' },
        { id: 'averageScore', title: 'Average Score' },
        { id: 'averageTimeSpent', title: 'Average Time Spent (minutes)' },
        { id: 'averageQuizScore', title: 'Average Quiz Score' },
        { id: 'quizScore', title: 'Quiz Score' },
      ],
    });

    // Records to be written to the CSV
    const records = [
      {
        courseID: courseID,
        averageScore: averageQuizScore,
        averageTimeSpent: interactions.reduce((sum, interaction) => sum + interaction.time_spent_minutes, 0) / interactions.length,
        averageQuizScore: averageQuizScore,
        quizScore: quizResponses.map(response => response.score),
      },
    ];

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const fileName = `course_analytics_${courseID}.csv`;
    const filePath = join(UPLOAD_DIR, fileName); // Save in the 'uploads' folder
    await csvWriter.writeRecords(records); // Write the CSV file

    const downloadLink = `/files/course-analytics/${fileName}`; // Relative link
    return {
      downloadLink,
      averageQuizScore: averageQuizScore,
      allGrades: quizResponses.map((response) => ({ id: response._id, score: response.score })),
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