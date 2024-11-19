import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesModule } from './notes/notes.module';
import * as process from 'node:process';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI: string = process.env.MONGO_URI;
@Module({
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
