import { Controller, Post, Put, Body, Param, UseInterceptors, UploadedFile, UseGuards, Get, Request, Req, } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/createCourse.dto';
import { UpdateCourseDto } from './dto/updateCourse.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { CreateThreadDTO } from './dto/createThread.dto';
import { threadId } from 'worker_threads';
import { CreatePostDTO } from './dto/createPost.dto';




@Controller('courses')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
  ) {}

  
  @Post()
  @Roles(['instructor'])
  async create(@Body() createCourseDto: CreateCourseDto, @Request() req: any) {
    const userId = req.user.user_id
    return this.coursesService.create(createCourseDto, userId);
  }

  
  @Put(':id')
  @Roles(['instructor'])
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @Request() req: any) {
    const userId = req.user.user_id
    return this.coursesService.updateCourse(id, updateCourseDto, userId);
  }

  @Get(':name')
  @Roles(['student', 'instructor', 'admin']) //Users can search for a certain course.
  async searchCourse(@Param('name') courseName: string){
    return this.coursesService.searchCourse(courseName)
  }

  
  @Post('/students/:id')
  @Roles(['student'])
  async enroll(@Param('id') courseId: string, @Request() req:any){
    const studentId = req.user.user_id
    return this.coursesService.studentEnrollCourse(studentId, courseId)
  }

  @Get('/students/:id')
  @Roles(['instructor'])
  async searchStudent(@Param('id') studentId: string, @Request() req: any){
    const InstructorId = req.user.user_id
    return this.coursesService.searchStudent(studentId, InstructorId)
  }

  @Get('/instructors/:id')
  @Roles(['student'])
  async searchInstructor(@Param('id') InstructorId){
    return this.coursesService.searchInstructor(InstructorId)
  }

  @Post(":CourseID/thread")
  @Roles(['instructor'])
  async createThread(@Param('CourseID') courseid: string, @Body() createThreadDTO: CreateThreadDTO, @Request() req: any){
    const instructorId = req.user.user_id
    return this.coursesService.createThread(courseid, createThreadDTO, instructorId)
  }

  @Get(':CourseID/threads')
  @Roles(['instructor', 'user'])
  async getAllThreads(){
    return this.coursesService.getAllThreads()
  }

  @Post(':CourseID/thread/:ThreadID/post')
  @Roles(['user', 'instructor'])
  async makePost(@Param("ThreadID") threadId: string, @Request() req: any, @Body() createPostDTO: CreatePostDTO){
    const userid = req.user.user_id
    const role = req.user.role
    return this.coursesService.makePost(threadId, createPostDTO, role, userid)
  }


  @Get(':CourseID/thread/:ThreadID/posts')
  @Roles(['instructor', 'user'])
  async getAllPostsOfThread(@Param('ThreadID') threadId: string, @Request() req: any){
    const instructorID = req.user.user_id
    return this.coursesService.getAllPostsOfThread(threadId, instructorID)
  }
}
