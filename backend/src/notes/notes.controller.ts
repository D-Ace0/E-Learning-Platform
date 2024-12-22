import { Controller, Post, Get, Param, Body, Delete, Patch } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDTO, UpdateNoteDTO } from './dto/note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async createNote(@Body() createNoteDTO: CreateNoteDTO) {
    try {
      return await this.notesService.create(createNoteDTO);
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  @Get('module/:moduleId')
  async getNotesByModule(@Param('moduleId') moduleId: string) {
    return this.notesService.findByModuleId(moduleId);
  }

  @Patch(':id')
  async updateNote(
      @Param('id') id: string,
      @Body() updateNoteDTO: Partial<UpdateNoteDTO>,
  ) {
    return this.notesService.update(id, updateNoteDTO);
  }

  @Delete(':id')
  async deleteNoteById(@Param('id') id: string) {
    return this.notesService.delete(id);
  }
}
