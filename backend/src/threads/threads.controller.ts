import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('threads')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Post('/course/:courseId/:forumId')
  @Roles(['instructor', 'student'])
  async create(@Body() createThreadDto: CreateThreadDto, @Request() req: any, @Param('courseId') courseId: string, @Param('forumId') forumId: string) {
    const userId = req.user.user_id
    const role = req.user.role
    return await this.threadsService.create(createThreadDto, userId, courseId, role, forumId);
  }

  @Get(":courseId")
  @Roles(['instructor', 'student'])
  findAll(@Request() req: any, @Param('courseId') courseId: string) {
    const role = req.user.role
    const userId = req.user.user_id
    return this.threadsService.findAll(courseId, userId, role);
  }

  @Get(':threadId')
  @Roles(['instructor', 'student'])
  findOne(@Param("threadId") threadId: string, @Request() req: any) {
    const role = req.user.role
    const userId = req.user.user_id
    return this.threadsService.findOne(threadId, userId, role);
  }

  @Patch(':threadId')
  @Roles(['instructor', 'student'])
  update(@Param('threadId') threadId: string, @Body() updateThreadDto: UpdateThreadDto, @Request() req: any) {
    const userId = req.user.user_id;
    const role = req.user.role;
    return this.threadsService.update(threadId, updateThreadDto, userId, role);
  }
  
  @Delete(':threadId')
  @Roles(['instructor', 'student'])
  remove(@Param('threadId') threadId: string, @Request() req: any) {
    const userId = req.user.user_id;
    const role = req.user.role;
    return this.threadsService.remove(threadId, userId, role);
  }
  
}
