import {Inject, Injectable} from '@nestjs/common';
import {SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {Server} from 'socket.io';
import {EventsHelper} from './helpers/socket.helper';
import {MESSAGE_PATTERNS, MICRO_SERVICE_INJECTION_TOKEN} from '../common/constants.common';
import {ClientProxy} from '@nestjs/microservices';
import {AdminChatService} from "../admin-chat/admin-chat.service";

@Injectable()
@WebSocketGateway()
export class EventsGatewayService {
  constructor(
    private readonly helper: EventsHelper,
    @Inject(MICRO_SERVICE_INJECTION_TOKEN.ELASTIC_SEARCH) private client: ClientProxy,
    private readonly adminChatService: AdminChatService,
  ) {
  }

  @WebSocketServer()
  private server: Server;
  private connectedUsers = {};
  private connectedSockets = {};

  async handleConnection(client): Promise<boolean> {
    try {
      const user = await this.helper.authenticateConnection(client.handshake.headers.cookie);
      this.connectedSockets[client.id] = user;
      if (this.connectedUsers[user]) {
        this.connectedUsers[user].push(client.id);
      } else {
        this.connectedUsers[user] = [client.id];
        client.emit('connected', 'connected');
      }
    } catch (e) {
      client.emit('unauthorized', e);
    }
    return true;
  }

  emitToUsersList(payload: any, list: string[], event: string): number {
    let receivers: string[] = [];
    list.forEach((user) => {
      if (this.connectedUsers[user]) {
        receivers = receivers.concat(this.connectedUsers[user]);
      }
    });
    console.log(receivers);
    if (receivers.length) {
      receivers.forEach(socket => {
        this.server.to(socket).emit(event, payload);
      });
    }

    return 1;
  }

  emitToUser(payload: any, user: string, event: string): boolean {
    if (this.connectedUsers[user]) {
      const socket = this.connectedUsers[user];
      this.server.to(socket).emit(event, payload);
      return true;
    } else {
      return false;
    }
  }

  async handleDisconnect(client): Promise<boolean> {
    const userId = this.connectedSockets[client.id];
    delete this.connectedSockets[client.id];
    if (userId) {
      this.connectedUsers[userId].pop(client.id);
      if (this.connectedUsers[userId].length < 1) {
        delete this.connectedUsers[userId];
      }
    }
    return true;
  }

  @SubscribeMessage('autocomplete')
  async autocompleteHandler(client, payload): Promise<any> {
    const suggestions = await this.client.send(MESSAGE_PATTERNS.AUTO_COMPLTEE_SUGGESTIONS, payload)
      .toPromise();
    client.emit('suggested', suggestions);
  }

  // testing
  @SubscribeMessage('mirror')
  mirror(client, payload): boolean {
    this.server.emit('mirror', payload)
    return true;
  }

  @SubscribeMessage('typing')
  typing(client, payload): boolean {
    let emit
    if ('to' in payload) {
      emit = payload.to
      delete payload['to']
    }
    this.server.emit(emit + '_typing', payload)
    return true;
  }

  @SubscribeMessage('riderChat')
  send(client, payload): boolean {
    this.server.emit(payload.to, payload)
    return true;
  }

  @SubscribeMessage('sendMessage')
  sendMessage(client, payload): boolean {
    let emit
    if ('to' in payload) {
      emit = payload.to
      delete payload['to']
    }
    this.server.emit(emit, payload)
    return true;
  }

  @SubscribeMessage('readMessage')
  async readMessage(client, payload) {
    const {adminChatId, from} = payload
    await this.adminChatService.patchAdminMessage({adminChatId, from})
    return true
  }

}
