import {Controller, Get, Param, Post, Body, Delete, HttpException, HttpStatus} from '@nestjs/common';
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



    @Delete(':notificationId')
    async deleteNotification(@Param('notificationId') notificationId: string): Promise<{ message: string }> {
        try {
            await this.notificationService.deleteNotification(notificationId);
            return { message: 'Notification deleted successfully.' };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete('user/:userId')
    async deleteAllNotifications(@Param('userId') userId: string): Promise<{ message: string }> {
        try {
            await this.notificationService.deleteAllNotifications(userId);
            return { message: 'All notifications deleted successfully.' };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}
