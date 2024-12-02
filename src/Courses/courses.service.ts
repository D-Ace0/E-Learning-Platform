import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { Course } from 'src/schemas/course.schema';
import { CreateCourseDto } from './dto/createCourse.dto';
import { UpdateCourseDto } from './dto/updateCourse.dto';
import { v4 as uuidv4 } from 'uuid';
import { isValidObjectId, Types } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { CreateThreadDTO } from './dto/createThread.dto';
import { Thread } from 'src/schemas/thread.schema';
import { CreatePostDTO } from './dto/createPost.dto';
import { Post } from 'src/schemas/post.schema';


@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>,
   @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Thread.name) private threadModel: Model<Thread>,
    @InjectModel(Post.name) private postModel: Model<Post>
  ) {}

  
  async create(createCourseDto: CreateCourseDto, userid: string) {
    const newCourse = new this.courseModel({
      ...createCourseDto,
      created_by: userid
    });
    if(await this.courseModel.findOne({title: newCourse.title})) throw new BadRequestException("Course with this title already exists!")

    return newCourse.save();
  }

  
  async updateCourse(id: string, updateCourseDto: UpdateCourseDto, instructor_id: string){

    if(!isValidObjectId(id)) throw new BadRequestException('Invalid course ID');

    const course = await this.courseModel.findById(id).exec()
    if(!course) throw new NotFoundException("Course Does not exist")
    
    const instructor_id_AS_ObjectId = new Types.ObjectId(instructor_id);
    if (course.created_by.toString() !== instructor_id_AS_ObjectId.toString()) throw new ForbiddenException('You cannot update this course');

    return await this.courseModel.findById(id, updateCourseDto)
  }


  async searchCourse(courseName: string){
    const course = await this.courseModel.findOne({title: courseName})
    if(!course) throw new NotFoundException('Course not found')
    return course
  }



  async studentEnrollCourse(studentId: string, courseId: string){
    const course = await this.courseModel.findById(courseId)
    if(!course) throw new NotFoundException('Course not found')
      

    // add the student to enrolledStudents in course document
    const studentId_ObjectId = new Types.ObjectId(studentId)
    const EnrolledStudentsIds = course.enrolledStudents
    if(EnrolledStudentsIds.includes(studentId_ObjectId as any)) throw new BadRequestException('You are already enrolled in this course')
    course.enrolledStudents.push(studentId_ObjectId as any)

    // add the course to the courses array of the user document
    const user = await this.userModel.findById(studentId).exec()
    const courseId_ObjectId = new Types.ObjectId(courseId)
    user.courses.push(courseId_ObjectId as any)
    await user.save()

    return await course.save()
  }

  async searchStudent(studentId: string, InstructorId: string){
    if(!isValidObjectId(studentId)) throw new BadRequestException()

    const coursesCreatedByInstructor = await this.courseModel.find({created_by: InstructorId}).exec()

    const studentEnrolled = coursesCreatedByInstructor.some((course) => //some loops over each course in the array of courses
      course.enrolledStudents.some(
        (enrolledStudent) => enrolledStudent.toString() === studentId,
      ),
    )

    if(!studentEnrolled) throw new ForbiddenException('The student you are searching for is not enrolled in any of your courses')
  
    const student = await this.userModel.findById(studentId).exec()
    const plainStudent = student.toObject();

    if(!student) throw new NotFoundException('Student Not Found')

    const {password_hash, role, ...StudentData} = plainStudent
    return StudentData
  }

  async searchInstructor(InstructorId: string){

    if(!isValidObjectId(InstructorId)) throw new BadRequestException()

    const instructor = await this.userModel.findById(InstructorId).exec()
    if(instructor.role.toString() !== "instructor") throw new ForbiddenException()

    const plainInstructor = instructor.toObject()
    const {password_hash, created_at, role, ...InstructorData} = plainInstructor

    return InstructorData
  }

  async createThread(courseId: string, createThreadDTO: CreateThreadDTO, instructorid: string){
    const course = await this.courseModel.findById(courseId).exec()
    if(!course) throw new NotFoundException()
    if(course.created_by.toString() !== instructorid) throw new ForbiddenException("You can't add thread for this course")
    
    const newThread = await new this.threadModel({...createThreadDTO, instructor_id: instructorid}).save()

    await this.courseModel.findByIdAndUpdate(courseId, {$push: {Thread: newThread}})
    return newThread
  }

  async makePost(threadId: string, createPostDTO :CreatePostDTO, role: string, userid: string){
    const thread = await this.threadModel.findById(threadId)
    if(!thread) throw new NotFoundException()

    if(createPostDTO.type === 'announcement' && role !== 'instructor') throw new ForbiddenException('Only Instructor can create announcement')

    const post = await new this.postModel({...createPostDTO, thread: threadId, user_id: userid}).save()
    
    await this.threadModel.findByIdAndUpdate(threadId, {$push: {posts: post}})
    return post
  }

  async getAllThreads(){
    return await this.threadModel.find()
  }

  async getAllPostsOfThread(threadId: string, instructorId: string) {
    if(!isValidObjectId(threadId)) throw new NotFoundException()
      
    const thread = await this.threadModel.findById(threadId).populate('posts').exec(); // this line will get all the posts object ids, and will go to the posts collection and get these posts
  
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }
  
    if (instructorId !== thread.instructor_id.toString()) {
      throw new ForbiddenException("You cannot view posts of another instructor's thread");
    }
  
    return thread.posts; 
  }
  

}