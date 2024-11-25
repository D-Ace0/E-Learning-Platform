import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Put,
} from '@nestjs/common'
import { Note } from 'src/note/models/note.schema'
import { NoteService } from 'src/note/note.service'
import { CreateNoteDto } from 'src/note/dto/create.note.dto'
import { UpdateNoteDto } from 'src/note/dto/update.note.dto'
import mongoose from 'mongoose'



@Controller('note')
//@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class NoteController {
  constructor(private noteService: NoteService) {}

  //Get all notes
  @Get()
  async getAllNotezes(): Promise<Note[]> {
    return await this.noteService.findAll()
  }

  //get note by id
  @Get(':note_id')
  async getNoteById(@Param('note_id') note_id: mongoose.Types.ObjectId) {
    // Get the note ID from the route parameters
    const note = await this.noteService.findById(note_id)
    return note
  }

  //Create note
  @Post()
  async createNote(@Body() noteData: CreateNoteDto) {
    // Get the new student data from the request body
    const newNote = await this.noteService.create(noteData)
    return newNote
  }

  // Update a note's details
  @Put(':note_id')
  async updateNote(
    @Param('note_id') note_id: mongoose.Types.ObjectId,
    @Body() noteData: UpdateNoteDto,
  ) {
    const updatedNote = await this.noteService.update(note_id, noteData)
    return updatedNote
  }

  // Delete a note by id
  @Delete(':note_id')
  async deleteNote(@Param('note_id') note_id: mongoose.Types.ObjectId) {
    const deletedNote = await this.noteService.delete(note_id)
    return deletedNote
  }
}
