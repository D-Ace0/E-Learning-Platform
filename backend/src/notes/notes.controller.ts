import {Controller, Post, Get, Param, Body, Delete, Patch, BadRequestException, Query} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDTO, UpdateNoteDTO } from './dto/note.dto';
import { Note } from '../schemas/notes.schema';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  // Create a note
  @Post()
  async createNote(@Body() createNoteDTO: CreateNoteDTO): Promise<Note> {
    return this.notesService.create(createNoteDTO);
  }

  @Get(':moduleId')
  async getNotesByModule(
      @Param('moduleId') moduleId: string,
      @Body() body: { user_id: string }, // Expect the user_id in the body
  ): Promise<Note[]> {
    const { user_id } = body;

    // Validate inputs
    if (!moduleId || moduleId.trim().length === 0) {
      throw new BadRequestException('Module ID is required');
    }

    if (!user_id || user_id.trim().length === 0) {
      throw new BadRequestException('User ID is required');
    }

    // Call the service to fetch notes
    return this.notesService.findByModuleAndUser(moduleId, user_id);
  }

  // Update a note
  @Patch(':id')
  async updateNote(
      @Param('id') id: string,
      @Body() updateNoteDTO: Partial<UpdateNoteDTO>,
      @Body('user_id') userId: string,
  ): Promise<Note> {
    return this.notesService.update(id, updateNoteDTO, userId);
  }

  // Delete a note
  @Delete(':id')
  async deleteNote(
      @Param('id') id: string,
      @Body('user_id') userId: string,
  ): Promise<void> {
    return this.notesService.delete(id, userId);
  }
}
