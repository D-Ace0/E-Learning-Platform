import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from 'src/schemas/notes.schema';
import { CreateNoteDTO, UpdateNoteDTO } from './dto/note.dto';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<NoteDocument>) {}

  async create(createNoteDTO: CreateNoteDTO): Promise<Note> {
    const createdNote = new this.noteModel(createNoteDTO);
    return createdNote.save();
  }

  async findById(id: string): Promise<Note> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid note ID');
    }

    const note = await this.noteModel.findById(id).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  async findAll(): Promise<Note[]> {
    return this.noteModel.find().exec();
  }

  async getAllMyNotes(userId: string): Promise<Note[]> {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated.');
    }

    try {
      const notes = await this.noteModel.find({ user_id: userId }).exec();
      return notes || [];
    } catch (err) {
      console.error(`Error fetching notes for user ${userId}:`, err);
      throw new InternalServerErrorException(
        `Failed to fetch notes: ${err.message}`,
      );
    }
  }

  async update(id: string, updateNoteDTO: Partial<UpdateNoteDTO>): Promise<Note> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid note ID');
    }

    const updatedNote = await this.noteModel
      .findByIdAndUpdate(id, updateNoteDTO, { new: true })
      .exec();
    if (!updatedNote) {
      throw new NotFoundException('Note not found');
    }
    return updatedNote;
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid note ID');
    }

    const result = await this.noteModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Note not found');
    }
  }
}
