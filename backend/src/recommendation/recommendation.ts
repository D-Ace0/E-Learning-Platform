import { Injectable,NotFoundException  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, {Model, Types} from 'mongoose';
import { Recommendation, RecommendationDocument} from "../schemas/Recommendation.schema";
import axios from 'axios';
import {ObjectId} from "mongodb";
import {User, UserDocument} from "../schemas/user.schema";
import{Course,CourseDocument} from "../schemas/course.schema";


@Injectable()
export class RecommendationService {
  private flaskApiUrl = 'http://localhost:6000/recommend'; // Flask endpoint

  constructor(
      @InjectModel(Recommendation.name)
      private readonly recommendationModel: Model<RecommendationDocument>,
      @InjectModel(User.name) private userModel: Model<UserDocument>,
      @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {
  }

  async getRecommendations(userId: ObjectId) {
    const courses=await this.userModel.findOne({_id:userId}).select("courses");

    const userData={userId:userId,courses:courses.courses};
    try {
      console.log('Sending payload to Flask API:', userData);

      const response = await axios.post(this.flaskApiUrl, userData);
      console.log('Flask API Response:', response.data);

      await this.saveRecommendations(userData.userId, response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getRecommendations:', error.response?.data || error.message);
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }







  // helper method for getRecommendations
  async saveRecommendations(userId: ObjectId, recommendedItems: string[]) {
    console.log('Saving recommendations for user:', userId, 'Items:', recommendedItems);

    const existingRecommendation = await this.recommendationModel.findOne({user_id: userId});
    console.log('Existing recommendation:', existingRecommendation);

    if (existingRecommendation) {
      existingRecommendation.recommended_items = recommendedItems;
      existingRecommendation.generated_at = new Date();
      await existingRecommendation.save();
      console.log('Updated existing recommendation:', existingRecommendation);
    } else {
      const newRecommendation = new this.recommendationModel({
        user_id: userId,
        recommended_items: recommendedItems,
      });
      await newRecommendation.save();
      console.log('Saved new recommendation:', newRecommendation);
    }
  }










  // this for adding the course that the user like to array of courses in his entry in the user table and
  //enrolling him in the course
  async addRecommendedCourseToUser(param: { title: string; userId: mongoose.Schema.Types.ObjectId }) {

      // Check if the user exists in the recommendations collection
      const userInRecommendation = await this.recommendationModel.findOne({
        user_id: param.userId,
      });

      if (!userInRecommendation) {
        throw new NotFoundException('User not found in recommendations');
      }

      // Check if the title exists in the recommended_items array
      const titleExists = await this.recommendationModel.find({
        user_id: param.userId,
        recommended_items: param.title, // Check if the array contains the title
      });

      if (!titleExists||titleExists.length===0) {
        return {message: 'Wrong title'};
      }

    const course = await this.courseModel.findOne({ title: param.title });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
      // checking if the Student is already enrolled in the course
    let doesntExistInCourse=await this.courseModel.find({
      _id: course._id,
      enrolledStudents: { $in: [param.userId] }
    });


    if (doesntExistInCourse.length!=0) {
      return { message: `Student is already enrolled in ${param.title}` };
    }

    course.enrolledStudents.push(param.userId);
    await course.save();


    const user=await this.userModel.findOne({_id: param.userId});
    if (!user) {
      throw new NotFoundException('User not found in user DB');
    }
    // checking if the courses doesn't exist in the course array in the user table
    let doesntExist=await this.userModel.find({
      _id: param.userId,
      courses: { $in: [course] }
    });

    if (doesntExist.length!=0) {
      return { message: 'Course already exists in the user\'s courses' };
    }


// Add the course to the user's courses array
    user.courses.push(course);
    await user.save();


    return { message: 'Course successfully added to user\'s courses' };

  }




  async getCourses(userId: mongoose.Schema.Types.ObjectId) {
    const userInRecommendation = await this.recommendationModel
        .findOne({ user_id: userId })
        .select('recommended_items');

// If no recommended items are found for the user
    if (!userInRecommendation || !userInRecommendation.recommended_items.length) {
      return { message: 'No recommended courses found for this user.' };
    }

// Step 2: Retrieve details for the recommended courses
    const recommendedCourses = await this.courseModel
        .find({
          title: { $in: userInRecommendation.recommended_items } // assuming recommended_items contains course IDs
        }); // Select the required fields

// Step 3: Map the results to return the details
    const courseDetails = recommendedCourses.map((course) => ({
      title: course.title,
      description: course.description,
      difficulty_level: course.difficulty_level,
      created_by: course.created_by,
      category: course.category,
      video_url: course.video,
      pdf_url: course.pdf,

    }));

    return courseDetails;
  }
}