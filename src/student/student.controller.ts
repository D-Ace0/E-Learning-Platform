import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
  } from '@nestjs/common'
  import { StudentService } from './student.service'
  import { Student } from 'src/student/models/student.schema'
  import { createStudentDto } from './dto/create.student.dto'
  import { updateStudentDto } from './dto/update.student.dto'
  import mongoose from 'mongoose'

@Controller('student')
export class StudentController {
    constructor(private studentService: StudentService){}

    // Get All Students
    @Get()
    async getAllStudents(): Promise<Student[]> {
        return await this.studentService.findAll()
    }

    //Get student by id
    @Get(':student_id')
    async getStudentById(@Param('student_id') student_id: mongoose.Types.ObjectId) {
        // Get the student ID from the route parameters
        const student = await this.studentService.findById(student_id)
        return student
    }

    //Create student
    @Post()
    async createStudent(@Body() studentData: createStudentDto) {
        // Get the new student data from the request body
        const newStudent = await this.studentService.create(studentData)
        return newStudent
    }
    
    // Update a student's details by Id
    @Put(':student_id')
    async updateStudent(
        @Param('student_id') student_id: mongoose.Types.ObjectId,
        @Body() studentData: updateStudentDto,
    ) {
        const updatedStudent = await this.studentService.update(student_id, studentData)
        return updatedStudent
    }

    // Delete a course by id
    @Delete(':student_id')
    async deleteStudent(@Param('student_id') student_id: mongoose.Types.ObjectId) {
        const deletedStudent = await this.studentService.delete(student_id)
        return deletedStudent
    }
}
