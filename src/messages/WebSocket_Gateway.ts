import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for development
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomService: RoomService) {}

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody() payload: { roomName: string; studentId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log('Join room payload:', payload);

    try {
      // Add the student to the room in the database
      const room = await this.roomService.addStudentToRoom(payload.roomName, payload.studentId);

      // Join the WebSocket room
      client.join(payload.roomName);

      // Emit a success event
      client.emit('roomJoined', { message: `Joined room: ${payload.roomName}`, room });
      console.log(`Client ${client.id} joined room: ${payload.roomName}`);
    } catch (error) {
      client.emit('error', error.message);
    }
  }
}
