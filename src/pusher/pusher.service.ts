import { Injectable } from '@nestjs/common';
import * as Pusher from 'pusher';
@Injectable()
export class PusherService {
    pusher:Pusher;
    constructor(){

  this.pusher = new Pusher({
  appId: "1899646",
  key: "8aa176e945112fadbd93",
  secret: "f47bb5c3a54752ad1202",
  cluster: "eu",
  useTLS: true
});

  

    }
    async trigger(channel:string,event:string,data:any){
      await this.pusher.trigger(channel,event,data)
    }
}

