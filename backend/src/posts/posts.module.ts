import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Thread, ThreadSchema } from 'src/schemas/thread.schema';
import { Post, PostSchema } from 'src/schemas/post.schema';
import { Course, CourseSchema } from 'src/schemas/course.schema';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Thread.name, schema: ThreadSchema },
      { name: Post.name, schema: PostSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
