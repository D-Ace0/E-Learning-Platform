import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesModule } from './notes/notes.module';
import * as process from 'node:process';
import * as dotenv from 'dotenv';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RolesGuard } from './guards/roles.guard';

dotenv.config();

const MONGO_URI: string = process.env.MONGO_URI;
@Module({
    providers:[
    {
      provide: APP_GUARD,
      useClass: JwtService,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  imports: [
    AuthModule,
    UsersModule,
    NotesModule,
    MongooseModule.forRoot(
      MONGO_URI ?? 'mongodb://127.0.0.1:27017/E-Learning-Platform',
    ),
  ],
})
export class AppModule {}
