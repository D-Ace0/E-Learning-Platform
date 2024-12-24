import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    const note = await this.noteModel.findById(id).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  async findAll(): Promise<Note[]> {
    return this.noteModel.find().exec();
  }
  async getMyNotes(userId: string){
    try{
   const notes=await this.noteModel.find({user_id:userId}).exec();
    if(!notes){
      throw new NotFoundException('Notes not found');
    }
    return
  }
  catch(err:any){
    return { statusCode: 500, message: 'Something went wrong', error: err.message };
  }   

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
    const result = await this.noteModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Note not found');
    }
  }
}
