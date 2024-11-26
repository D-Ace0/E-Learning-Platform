import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Note, NoteDocument } from 'src/note/models/note.schema'
import { CreateNoteDto } from 'src/note/dto/create.note.dto'
import { UpdateNoteDto } from 'src/note/dto/update.note.dto'
import mongoose from 'mongoose'



@Injectable()
export class NoteService { 
  constructor(
    @InjectModel(Note.name) private noteModel: mongoose.Model<Note>
  ) {}

  // create a note
  async create(noteData: CreateNoteDto): Promise<NoteDocument> {
    const newNote = new this.noteModel(noteData) // Use DTO for note creation
    return await newNote.save() // Save it to the database
  }

  // Get all notes
  async findAll(): Promise<NoteDocument[]> {
    let notes = await this.noteModel.find()  // Fetch all notes from the database
    return notes
  }

  // Get a note by ID
  async findById(note_id: mongoose.Types.ObjectId): Promise<NoteDocument> {
    return await this.noteModel.findById(note_id)  // Fetch a note by ID
  }

  // Update a note's details by ID
  async update(note_id: mongoose.Types.ObjectId, updateData: UpdateNoteDto): Promise<NoteDocument> {
    return await this.noteModel.findByIdAndUpdate(note_id, updateData, { new: true })  // Find and update the note
  } 

  // Delete a note by ID
  async delete(note_id: mongoose.Types.ObjectId): Promise<NoteDocument> {
    return await this.noteModel.findByIdAndDelete(note_id)  // Find and delete the note
  }

}
