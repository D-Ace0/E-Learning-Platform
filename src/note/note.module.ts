import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { NoteController } from './note.controller'
import { NoteService } from './note.service'
import { Note, NoteSchema } from 'src/note/models/note.schema'



@Module({
  imports: [MongooseModule.forFeature([{ name: "Note", schema: NoteSchema }])],
  controllers: [NoteController],
  providers: [NoteService],
})

export class NotesModule {}
