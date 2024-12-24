import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ForumsService } from './forums.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('forum')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Post("course/:courseId")
  @Roles(['instructor', 'student'])
  async create(@Param("courseId") courseId: string, @Body() createForumDto: CreateForumDto, @Request() req:any) {
    const instructorId = req.user.user_id
    const role = req.user.role
    return await this.forumsService.create(createForumDto, instructorId, courseId, role);
  }

  @Get()
  @Roles(['instructor', 'student'])
  async findAll(@Request() req:any) {
    const userId = req.user.user_id
    const role = req.user.role
    return await this.forumsService.findAll(userId, role);
  }

  @Get(':id')
  @Roles(['instructor', 'student'])
  async findOne(@Param('id') forumId: string, @Request() req:any) {
    const userId = req.user.user_id
    const role = req.user.role
    return await this.forumsService.findOne(forumId, userId, role);
  }

  @Patch(':id')
  @Roles(['instructor', 'student'])
  async update(@Param('id') forumId: string, @Body() updateForumDto: UpdateForumDto, @Request() req:any) {
    const userId = req.user.user_id
    const role = req.user.role
    return await this.forumsService.update(forumId, updateForumDto, userId);
  }

  @Delete(':id')
  @Roles(['instructor', 'student'])
  async remove(@Param('id') forumId: string, @Request() req:any) {
    const instructorId = req.user.user_id
    const role = req.user.role
    return await this.forumsService.remove(forumId, instructorId, role);
  }
}