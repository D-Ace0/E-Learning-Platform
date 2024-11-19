import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    NotesModule,
    MongooseModule.forRoot(
      'mongodb+srv://AhmedKhadrawy:i6OKYku0wf8xamTL@database.r38ac.mongodb.net/',
    ),
  ],
})
export class AppModule {}
