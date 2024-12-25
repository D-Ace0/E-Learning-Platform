import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../Communication_schemas/notification.schema';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
    ) {}

    async createNotification(userId: string, content: string, roomId: string): Promise<NotificationDocument> {
        const notification = new this.notificationModel({
            user: userId,
            content,
            room: roomId,
            createdAt: new Date(),
        });
        return notification.save();
    }

    async getUserNotifications(userId: string): Promise<NotificationDocument[]> {
        return this.notificationModel
            .find({ user: userId })
            .populate('room', 'name') // Populate the room field to get its name
            .exec();
    }
}
