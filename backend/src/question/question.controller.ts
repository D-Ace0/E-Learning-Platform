import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { QuestionService } from './question.service';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('question')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(['instructor'])
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  findAll() {
    return this.questionService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionService.remove(id);
  }
}
