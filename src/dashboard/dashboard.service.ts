import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Course, CourseDocument } from '../schemas/course.schema';
import { Progress, ProgressDocument } from '../schemas/progress.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getStudentDashboard(user_id:string): Promise<{ name: string; courses: { course: any; completionPercentage: number }[] }> {
    const user = await this.userModel.findOne({_id:user_id})
      .select('name')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const courses = await this.courseModel
      .find()
      .exec();

    const dashboardData = await Promise.all(courses.map(async (course) => {
      const progress = await this.progressModel
        .findOne({course_id: course._id })
        .select('completionPercentage')
        .lean()
        .exec();

      return {
        course,
        completionPercentage: progress?.completionpercentage ?? 0,
      };
    }));

    return {
      name: user.name,
      courses: dashboardData,
    };
  }
}