import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { QuestionService } from './question.service';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateQuestionDto } from './dto/create-question.dto';

@Controller('question')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(['instructor'])
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Roles(['instructor'])
  @Get()
  findAll(@Request() req: any) {
    const InstructorId = req.user.user_id
    return this.questionService.findAll(InstructorId);
  }

  @Patch(':id')
  @Roles(['instructor'])
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto, @Request() req: any) {
    const InstructorId = req.user.user_id
    return this.questionService.update(id, updateQuestionDto, InstructorId);
  }

  @Delete(':id')
  @Roles(['instructor'])
  remove(@Param('id') id: string, @Request() req: any) {
    const InstructorId = req.user.user_id
    return this.questionService.remove(id, InstructorId);
  }

  @Roles(['instructor'])
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto, @Request() req: any) {
    const InstructorId = req.user.user_id
    return this.questionService.create(createQuestionDto, InstructorId);
  }

  @Roles(['instructor', 'student'])
  @Get('module/:moduleId')
  findByModuleId(@Param('moduleId') moduleId: string, @Request() req: any) {
    const userId = req.user.user_id
    const role = req.user.role
    return this.questionService.findByModuleId(moduleId, userId, role);
  }
}
