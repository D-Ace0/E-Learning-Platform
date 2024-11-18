import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/E-Learning-Platform'),
    NotesModule, // Import NotesModule here
  ],
})
export class AppModule {}
