import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from '../schemas/notes.schema';
import { Module, ModuleDocument } from '../schemas/module.schema';
import { CreateNoteDTO, UpdateNoteDTO } from './dto/note.dto';

@Injectable()
export class NotesService {
  constructor(
      @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
      @InjectModel(Module.name) private readonly moduleModel: Model<ModuleDocument>,
  ) {}

  // Create a new note
  async create(createNoteDTO: CreateNoteDTO): Promise<Note> {
    const { user_id, module_id, content } = createNoteDTO;

    // Check if module exists
    const moduleExists = await this.moduleModel.findById(module_id).exec();
    if (!moduleExists) {
      throw new NotFoundException('Module not found');
    }

    // Create and save the note
    const createdNote = new this.noteModel({ user_id, module_id, content });
    const savedNote = await createdNote.save();

    return savedNote;
  }

  /**
   * Get notes by moduleId and userId
   * @param moduleId - The ID of the module
   * @param userId - The ID of the user
   * @returns An array of notes
   */
  async findByModuleAndUser(moduleId: string, userId: string): Promise<Note[]> {
    // Convert moduleId and userId to ObjectId for MongoDB compatibility
    const moduleObjectId = new Types.ObjectId(moduleId);
    const userObjectId = new Types.ObjectId(userId);

    // Fetch notes from the database
    const notes = await this.noteModel.find({
      module_id: moduleObjectId,
      user_id: userObjectId,
    }).exec();

    // If no notes are found, throw a NotFoundException
    if (!notes || notes.length === 0) {
      throw new NotFoundException('No notes found for the given module and user');
    }

    return notes;
  }

  // Update a note
  async update(id: string, updateNoteDTO: Partial<UpdateNoteDTO>, userId: string): Promise<Note> {
    const note = await this.noteModel.findById(id).exec();
    if (!note || note.user_id.toString() !== userId) {
      throw new NotFoundException('Note not found or unauthorized');
    }

    const updatedNote = await this.noteModel.findByIdAndUpdate(id, updateNoteDTO, { new: true }).exec();
    return updatedNote;
  }

  // Delete a note
  async delete(id: string, userId: string): Promise<void> {
    const note = await this.noteModel.findById(id).exec();
    if (!note || note.user_id.toString() !== userId) {
      throw new NotFoundException('Note not found or unauthorized');
    }

    await this.moduleModel.findByIdAndUpdate(note.module_id, {
      $pull: { notes: id },
    });

    await this.noteModel.findByIdAndDelete(id).exec();
  }
}
