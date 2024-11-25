import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {DashboardController} from "./dashboard.controller";
import { DashboardService } from './dashboard.service';
import { Course, CourseSchema } from '../schemas/course.schema';
import { Progress, ProgressSchema } from '../schemas/progress.schema';
import { Response, ResponseSchema } from '../schemas/response.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: Response.name, schema: ResponseSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}