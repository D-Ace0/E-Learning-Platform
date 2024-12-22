import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note, NoteDocument } from '../schemas/notes.schema';
import { Module, ModuleDocument } from '../schemas/module.schema';
import { CreateNoteDTO, UpdateNoteDTO } from './dto/note.dto';

@Injectable()
export class NotesService {
  constructor(
      @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
      @InjectModel(Module.name) private readonly moduleModel: Model<ModuleDocument>,
  ) {}

  async create(createNoteDTO: CreateNoteDTO): Promise<Note> {
    const createdNote = new this.noteModel(createNoteDTO);
    const savedNote = await createdNote.save();

    // Update the module's notes array
    const updatedModule = await this.moduleModel.findByIdAndUpdate(
        createNoteDTO.module_id,
        { $push: { notes: savedNote._id } },
        { new: true },
    );
    if (!updatedModule) {
      throw new NotFoundException('Module not found');
    }

    return savedNote;
  }

  async findByModuleId(moduleId: string): Promise<Note[]> {
    return this.noteModel.find({ module_id: moduleId }).exec();
  }

  async update(id: string, updateNoteDTO: Partial<UpdateNoteDTO>): Promise<Note> {
    const updatedNote = await this.noteModel
        .findByIdAndUpdate(id, updateNoteDTO, { new: true })
        .exec();
    if (!updatedNote) {
      throw new NotFoundException('Note not found');
    }
    return updatedNote;
  }

  async delete(id: string): Promise<void> {
    const note = await this.noteModel.findById(id).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Remove the note from the module's notes array
    await this.moduleModel.findByIdAndUpdate(note.module_id, {
      $pull: { notes: id },
    });

    await this.noteModel.findByIdAndDelete(id).exec();
  }
}
