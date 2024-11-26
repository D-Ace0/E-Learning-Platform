import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Student } from 'src/student/models/student.schema'
import { createStudentDto } from './dto/create.student.dto'
import { updateStudentDto } from './dto/update.student.dto'
import mongoose from 'mongoose'

@Injectable()
export class StudentService {
  constructor(@InjectModel(Student.name) private studentModel: mongoose.Model<Student>) {}


  // create a student
  async create(studentData: createStudentDto): Promise<Student> {
    const newStudent = new this.studentModel(studentData) // Use DTO for student creation
    return await newStudent.save() // Save it to the database
  }

  // Get all students
  async findAll(): Promise<Student[]> {
    let students = await this.studentModel.find()  // Fetch all students from the database
    return students
  }

  // Get a student by ID
  async findById(student_id: mongoose.Types.ObjectId): Promise<Student> {
    return await this.studentModel.findById(student_id)  // Fetch a student by ID
  }

  // Update a student's details by ID
  async update(student_id: mongoose.Types.ObjectId, updateData: updateStudentDto): Promise<Student> {
    return await this.studentModel.findByIdAndUpdate(student_id, updateData, { new: true })  // Find and update the student
  } 

  // Delete a student by ID
  async delete(student_id: mongoose.Types.ObjectId): Promise<Student> {
    return await this.studentModel.findByIdAndDelete(student_id)  // Find and delete the course
  }
}
