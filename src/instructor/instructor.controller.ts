import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
  } from '@nestjs/common'
  import { InstructorService } from 'src/instructor/instructor.service'
  import { Instructor } from 'src/instructor/models/instructor.schema'
  import { createInstructorDto } from 'src/instructor/dto/create.instructor.dto'
  import { updateInstructorDto } from 'src/instructor/dto/update.instructor.dto'
  import mongoose from 'mongoose'

@Controller('instructor')
export class InstructorController {
    constructor(private instructorService: InstructorService){}

    // Get All Instructors
    @Get()
    async getAllInstructors(): Promise<Instructor[]> {
        return await this.instructorService.findAll()
    }

    //Get instructor by id
    @Get(':instructor_id')
    async getInstructorById(@Param('instructor_id') instructor_id: mongoose.Types.ObjectId) {
        // Get the instructor ID from the route parameters
        const instructor = await this.instructorService.findById(instructor_id)
        return instructor
    }

    //Create instructor
    @Post()
    async createInstructor(@Body() instructorData: createInstructorDto) {
        // Get the new instructor data from the request body
        const newInstructor = await this.instructorService.create(instructorData)
        return newInstructor
    }
    
    // Update a instructor's details by Id
    @Put(':instructor_id')
    async updateInstructor(
        @Param('instructor_id') instructor_id: mongoose.Types.ObjectId,
        @Body() instructorData: updateInstructorDto,
    ) {
        const updatedInstructor = await this.instructorService.update(instructor_id, instructorData)
        return updatedInstructor
    }

    // Delete a course by id
    @Delete(':instructor_id')
    async deleteInstructor(@Param('instructor_id') instructor_id: mongoose.Types.ObjectId) {
        const deletedInstructor = await this.instructorService.delete(instructor_id)
        return deletedInstructor
    }
}
