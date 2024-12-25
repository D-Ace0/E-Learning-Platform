import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { NotificationService } from '../Communication_Service/notification.service';

@Controller('notifications') // Route is '/notifications'
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post()
    async createNotification(
        @Body() body: { userId: string; content: string; roomId: string },
    ): Promise<any> {
        return this.notificationService.createNotification(body.userId, body.content, body.roomId);
    }

    @Get(':userId')
    async getUserNotifications(@Param('userId') userId: string): Promise<any> {
        const notifications = await this.notificationService.getUserNotifications(userId);
        return notifications.map((notification) => ({
            id: notification._id,
            message: notification.content,
            roomName: notification.room['name'], // Assuming the `room` is populated

        }));
    }
}
