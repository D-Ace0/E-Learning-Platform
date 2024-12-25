import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from '../Communication_schemas/notification.schema';
import { NotificationService } from '../Communication_Service/notification.service';
import { NotificationController } from '../Communication_Controllers/notification.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    ],
    providers: [NotificationService],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule {}
