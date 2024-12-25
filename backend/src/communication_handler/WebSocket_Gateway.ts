import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './Communication_Service/room.service';
import { UsersService } from '../users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Message, MessageDocument } from './Communication_schemas/message.schema';
import { NotificationService } from './Communication_Service/notification.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly roomService: RoomService,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService, // Inject NotificationService
    @InjectModel('Message') private readonly messageModel: Model<MessageDocument>,
  ) {
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
      @MessageBody() payload: { roomName: string; studentId: string; content: string },
      @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.debug('[DEBUG] Payload received:', payload);

    try {
      const room = await this.roomService.findByName(payload.roomName);
      if (!room) throw new Error(`Room "${payload.roomName}" does not exist.`);

      const user = await this.usersService.findById(payload.studentId);
      if (!user) throw new Error(`User with ID "${payload.studentId}" does not exist.`);

      // Save the message
      const message = new this.messageModel({
        sender: user._id,
        content: payload.content,
        timestamp: new Date(),
      });
      const savedMessage = await message.save();
      console.debug('[DEBUG] Message saved:', savedMessage);

      // Add the message to the room's messages array
      room.messages.push(savedMessage._id as mongoose.Types.ObjectId);
      await room.save();

      console.debug('[DEBUG] Room updated:', room);

      // Emit the message back to all clients in the room
      this.server.to(payload.roomName).emit('messageReceived', {
        message: {
          id: savedMessage._id,
          sender: { id: user._id, name: user.name, email: user.email, role: user.role },
          content: savedMessage.content,
          timestamp: savedMessage.timestamp,
        },
      });
      console.debug('[DEBUG] Message emitted to room:', payload.roomName);

      // Create a notification for all users in the room except the sender
      const joinedUsers = room.joined_students.filter(
          (studentId) => studentId.toString() !== user._id.toString(),
      );
      for (const joinedUser of joinedUsers) {
        await this.notificationService.createNotification(
            joinedUser.toString(),
            `New message in room "${room.name}"`,
            room._id.toString(),
        );
      }
    } catch (error) {
      console.error('[ERROR] sendMessage:', error.message);
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
      @MessageBody() payload: { roomName: string; studentId: string },
      @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.debug('[DEBUG] joinRoom payload:', payload);

    try {
      // Find the room
      const room = await this.roomService.findByName(payload.roomName);
      if (!room) throw new Error(`Room "${payload.roomName}" does not exist.`);

      // Join the WebSocket room
      client.join(payload.roomName);

      // Ensure the user exists
      const user = await this.usersService.findById(payload.studentId);
      if (!user) throw new Error(`User with ID "${payload.studentId}" does not exist.`);

      // Add the student to the room using RoomService
      console.debug('[DEBUG] Adding student to room...');
      const updatedRoom = await this.roomService.addStudentToRoom(payload.roomName, payload.studentId);

      console.debug('[DEBUG] Updated room after adding student:', updatedRoom);

      // Fetch messages associated with the room
      const messages = await this.messageModel
          .find({ _id: { $in: updatedRoom.messages } })
          .populate('sender', 'name email role')
          .exec();

      // Emit an event back to the client
      client.emit('roomJoined', {
        message: `Successfully joined room "${updatedRoom.name}"`,
        room: { name: updatedRoom.name },
        user,
        messages,
      });

      console.debug('[DEBUG] User successfully joined the room:', { updatedRoom, user, messages });
    } catch (error) {
      console.error('[ERROR] joinRoom:', error.message);
      client.emit('error', error.message);
    }
  }



}
