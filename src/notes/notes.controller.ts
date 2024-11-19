import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Put,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDTO, UpdateNoteDTO } from './dto/note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async createNote(@Body() createNoteDTO: CreateNoteDTO) {
    return this.notesService.create(createNoteDTO);
  }

  @Get(':id')
  async getNoteById(@Param('id') id: string) {
    return this.notesService.findById(id);
  }

  @Get()
  async getAllNotes() {
    return this.notesService.findAll();
  }

  @Put(':id')
  async updateNote(
    @Param('id') id: string,
    @Body() updateNoteDTO: UpdateNoteDTO,
  ) {
    return this.notesService.update(id, updateNoteDTO);
  }

  @Delete(':id')
  async deleteNoteById(@Param('id') id: string) {
    return this.notesService.delete(id);
  }
}
