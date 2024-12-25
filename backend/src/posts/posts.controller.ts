import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';

@Controller('posts')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('thread/:threadId/course/:courseId')
  @Roles(['instructor', 'student'])
  async create(
    @Param('threadId') threadId: string,
    @Param('courseId') courseId: string,
    @Body() createPostDto: CreatePostDto,
    @Request() req: any,
  ) {
    const userId = req.user.user_id
    const role = req.user.role
    return await this.postsService.create(createPostDto, threadId, courseId, role, userId);
  }

  @Get('thread/:threadId/course/:courseId')
  @Roles(['instructor', 'student'])
  async findAll(
    @Param('threadId') threadId: string,
    @Param('courseId') courseId: string,
    @Request() req: any,
  ) {
    const userId = req.user.user_id
    const role = req.user.role
    return await this.postsService.findAll(courseId, threadId, role, userId);
  }

  @Get(':id/course/:courseId')
  @Roles(['instructor', 'student'])
  async findOne(
    @Param('id') postId: string,
    @Param('courseId') courseId: string,
    @Request() req: any,
  ) {
    const userId = req.user.user_id
    const role = req.user.role
    return await this.postsService.findOne(postId, courseId, role, userId);
  }

  @Patch(':id')
  @Roles(['instructor', 'student'])
  async update(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: any,
  ) {
    const userId = req.user.user_id
    const role = req.user.role
    return await this.postsService.update(postId, updatePostDto, userId, role);
  }

  @Delete(':id')
  @Roles(['instructor', 'student'])
  async remove(@Param('id') postId: string, @Request() req: any) {
    const userId = req.user.user_id
    const role = req.user.role
    return await this.postsService.remove(postId, userId, role);
  }
}
