import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {DashboardController} from "./dashboard.controller";
import { DashboardService } from './dashboard.service';
import { Course, CoursesSchema } from '../schemas/courses.schema';
import { Progress, ProgressSchema } from '../schemas/progress.schema';
import { Response, ResponseSchema } from '../schemas/response.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Quiz, QuizSchema } from '../schemas/quiz.schema';
import { UserInteraction, UserInteractionSchema } from '../schemas/user_interaction';
import { ModuleSchema } from "src/schemas/module.schema";


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CoursesSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: Response.name, schema: ResponseSchema },
      { name: User.name, schema: UserSchema },
      { name: Quiz.name, schema: QuizSchema },
      {name: Module.name, schema: ModuleSchema},
      { name: UserInteraction.name, schema: UserInteractionSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}