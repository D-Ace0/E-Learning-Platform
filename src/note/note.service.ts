import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Note } from 'src/note/models/note.schema'
import { CreateNoteDto } from 'src/note/dto/create.note.dto'
import { UpdateNoteDto } from 'src/note/dto/update.note.dto'
import mongoose from 'mongoose'



@Injectable()
export class NoteService {
  constructor(
    @InjectModel(Note.name) private noteModel: mongoose.Model<Note>, // Injects the Module model
  ) {}

  // create a notes
  async create(notesData: CreateNoteDto): Promise<Note> {
    const newNote = new this.noteModel(notesData) // Use Dto for note creation
    return await newNote.save() // Save it to the database
  }

  // Get all notes
  async findAll(): Promise<Note[]> {
    let notes = await this.noteModel.find()  // Fetch all notes from the database
    return notes
  }

  // Get a note by ID
  async findById(notes_id: mongoose.Types.ObjectId): Promise<Note> {
    return await this.noteModel.findById(notes_id)  // Fetch a note by ID
  }

  // Update a note's details by ID
  async update(notes_id: mongoose.Types.ObjectId, updateData: UpdateNoteDto): Promise<Note> {
    return await this.noteModel.findByIdAndUpdate(notes_id, updateData, { new: true })  // Find and update the note
  } 

  // Delete a note by ID
  async delete(notes_id: mongoose.Types.ObjectId): Promise<Note> {
    return await this.noteModel.findByIdAndDelete(notes_id)  // Find and delete the note
  }

}
