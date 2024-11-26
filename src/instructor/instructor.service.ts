import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Instructor, InstructorDocument } from 'src/instructor/models/instructor.schema'
import { createInstructorDto } from 'src/instructor/dto/create.instructor.dto'
import { updateInstructorDto } from 'src/instructor/dto/update.instructor.dto'
import mongoose from 'mongoose'

@Injectable()
export class InstructorService {
  constructor(@InjectModel(Instructor.name) private instructorModel: mongoose.Model<Instructor>) {}


  // create a instructor
  async create(instructorData: createInstructorDto): Promise<InstructorDocument> {
    const newInstructor = new this.instructorModel(instructorData) // Use DTO for instructor creation
    return await newInstructor.save() // Save it to the database
  }

  // Get all instructors
  async findAll(): Promise<InstructorDocument[]> {
    let instructors = await this.instructorModel.find()  // Fetch all instructors from the database
    return instructors
  }

  // Get a instructor by ID
  async findById(instructor_id: mongoose.Types.ObjectId): Promise<InstructorDocument> {
    return await this.instructorModel.findById(instructor_id)  // Fetch a instructor by ID
  }

  // Update a instructor's details by ID
  async update(instructor_id: mongoose.Types.ObjectId, updateData: updateInstructorDto): Promise<InstructorDocument> {
    return await this.instructorModel.findByIdAndUpdate(instructor_id, updateData, { new: true })  // Find and update the instructor
  } 

  // Delete a instructor by ID
  async delete(instructor_id: mongoose.Types.ObjectId): Promise<InstructorDocument> {
    return await this.instructorModel.findByIdAndDelete(instructor_id)  // Find and delete the course
  }
}
