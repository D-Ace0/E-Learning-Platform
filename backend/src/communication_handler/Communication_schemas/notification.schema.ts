import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user: mongoose.Schema.Types.ObjectId; // The user who will receive the notification

    @Prop({ type: String, required: true })
    content: string; // The message content

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true })
    room: mongoose.Schema.Types.ObjectId; // The room the notification belongs to
}

export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);
