import { Admin, User } from 'generated/prisma';
import { Server, Socket } from 'socket.io';
import { AppService } from './app.service';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  MessageBody,
} from '@nestjs/websockets';

interface OnlineBody {
  tlp: string;
  role: string;
}

interface Users extends OnlineBody {
  socket: Socket;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private users: Users[] = [];

  @WebSocketServer()
  server: Server;

  constructor(private readonly service: AppService) {}

  afterInit(server: any) {}

  handleConnection(@ConnectedSocket() client: Socket) {}

  // Only for signed-in users (admin, user)
  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.offline(client);
  }

  findUser(client: Socket) {
    return this.users.find((u) => u.socket == client);
  }

  broadcast(event: string, data: any, client: Socket) {
    // Broadcast to all connected devices except me
    client.broadcast.emit(event, data);
  }

  // Only for signed-in users (admin, user)
  // Triggered by logout button
  // Videotron and other monitor system will never send this event
  @SubscribeMessage('offline')
  async offline(@ConnectedSocket() client: Socket) {
    // Find for matched user
    const matchedUser = this.findUser(client);
    if (matchedUser) {
      // Find index for matched user
      const matchedUserIndex = this.users.indexOf(matchedUser);

      // Remove matched user
      this.users.splice(matchedUserIndex, 1);

      // Update online status to false
      await this.service.logout(matchedUser.tlp, matchedUser.role);

      // Broadcast to all connected devices except me
      this.broadcast('offline', matchedUser.tlp, client);
    }
  }

  // Only for signed-in users (admin, user)
  // Triggered after login
  // Videotron and other monitor system will never send this event
  @SubscribeMessage('online')
  async online(
    @MessageBody() { tlp, role }: OnlineBody,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    // Find for matched user
    const matchedUser = this.findUser(client);

    // Add new user if not exist
    if (!matchedUser) {
      // Add new user
      this.users.push({ tlp, role, socket: client });

      // Update online status to true
      await this.service.login(tlp, role);

      // Broadcast to all connected devices except me
      this.broadcast('online', tlp, client);
    }
  }

  @SubscribeMessage('new-admin')
  async newAdmin(
    @MessageBody() data: Admin,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.broadcast('new-admin', data, client);
  }

  @SubscribeMessage('update-admin')
  async updateAdmin(
    @MessageBody() data: Admin,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.broadcast('update-admin', data, client);
  }

  @SubscribeMessage('delete-admin')
  async deleteAdmin(
    @MessageBody() data: Admin,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.broadcast('delete-admin', data, client);
  }

  @SubscribeMessage('new-user')
  async newUser(
    @MessageBody() data: User,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.broadcast('new-user', data, client);
  }

  @SubscribeMessage('update-user')
  async updateUser(
    @MessageBody() data: User,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.broadcast('update-user', data, client);
  }

  @SubscribeMessage('delete-user')
  async deleteUser(
    @MessageBody() data: User,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.broadcast('delete-user', data, client);
  }
}
