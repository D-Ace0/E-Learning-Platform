import { Controller, Post, Put, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/Upload Module/upload.module';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';




@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly uploadService: UploadService,
  ) {}

  
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, updateCourseDto);
  }

  @Put(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadContent(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const filePath = await this.uploadService.uploadFile(file);
    const updateCourseDto = { newContent: filePath }; 
    return this.coursesService.updateCourse(id, updateCourseDto);
  }
}
