import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { Note, NoteSchema } from '../schemas/notes.schema';
import { Module as ModuleEntity, ModuleSchema } from '../schemas/module.schema'; // Import ModuleSchema

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Note.name, schema: NoteSchema },
      { name: ModuleEntity.name, schema: ModuleSchema }, // Register ModuleSchema
    ]),
  ],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService], // Export if other modules require NotesService
})
export class NotesModule {}
