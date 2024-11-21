import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from 'src/schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { v4 as uuidv4 } from 'uuid';
import { isValidObjectId, Types } from 'mongoose';


@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>) {}

  
  async create(createCourseDto: CreateCourseDto, userid: string) {
    const newCourse = new this.courseModel({
      ...createCourseDto,
      created_by: userid
    });
    if(await this.courseModel.findOne({course_id: newCourse.course_id})) throw new BadRequestException("Course with this ID already exists!")

    return newCourse.save();
  }

  
  async updateCourse(id: string, updateCourseDto: UpdateCourseDto, userid: string){

    if(!isValidObjectId(id)) throw new BadRequestException('Invalid course ID');


    const course = await this.courseModel.findById(id).exec()
    if(!course) throw new NotFoundException("Course Does not exist")
    
      const userIdObjectId = new Types.ObjectId(userid);

      if (course.created_by.toString() !== userIdObjectId.toString()) {
        throw new ForbiddenException('You cannot update this course');
      }
    
    

    const newCourseId = `${course.course_id}_${uuidv4()}`;

    const {_id, ...oldContentOfCourseWithoutObjectId} = course

    const newCourse = new this.courseModel({
      oldContentOfCourseWithoutObjectId,
      ...updateCourseDto,
      course_id: newCourseId,
      parentVersion: course.course_id,
      created_at: new Date(),
      created_by: userid
    })
    
    return newCourse.save()
  }

  async searchCourse(courseName: string){

  }


}
