import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Put, Patch,UseGuards
} from "@nestjs/common";
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { ResourceAccessGuard } from 'src/guards/resource-access.guard';
import { NotesService } from './notes.service';
import { CreateNoteDTO, UpdateNoteDTO } from './dto/note.dto';


@UseGuards(AuthenticationGuard, AuthorizationGuard, ResourceAccessGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @Roles(['instructor', 'student'])
  async createNote(@Body() createNoteDTO: CreateNoteDTO) {
    return this.notesService.create(createNoteDTO);
  }
  @Roles(['instructor', 'student'])
  @Get(':id')
  async getNoteById(@Param('id') id: string) {
    return this.notesService.findById(id);
  }

  @Get()
  @Roles(['instructor', 'student'])
  async getAllNotes() {
    return this.notesService.findAll();
  }
  @Get('myNote/:id')
  @Roles(['instructor', 'student'])
  async getMyNotes(@Param('id')id:string) {
    return this.notesService.getMyNotes(id);
  }

  @Put(':id')
  @Roles(['instructor', 'student'])
  async updateNote(
    @Param('id') id: string,
    @Body() updateNoteDTO: UpdateNoteDTO,
  ) {
    return this.notesService.update(id, updateNoteDTO);
  }

  @Delete(':id')
  @Roles(['instructor', 'student'])
  async deleteNoteById(@Param('id') id: string) {
    return this.notesService.delete(id);
  }
  @Patch(':id')
  @Roles(['instructor', 'student'])
  async patchNote(
    @Param('id') id: string,
    @Body() updateNoteDTO: Partial<UpdateNoteDTO>,
  ) {
    return this.notesService.update(id, updateNoteDTO);
  }

}
