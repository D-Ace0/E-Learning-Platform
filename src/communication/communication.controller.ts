import { Body, Controller,Get,Post } from "@nestjs/common";
import { stringify } from "querystring";
import { PusherService } from "src/pusher/pusher.service";

@Controller('api')
export class CommunicationController{
    constructor(private pusherService:PusherService){

    }
    
 @Post("messages")
 async messages(
    @Body('username') username:String,
    @Body('message')  message:String
 )
 
 {
    await this.pusherService.trigger('chat','message',{
        username,
        message
    });

 

return [];
 }

}