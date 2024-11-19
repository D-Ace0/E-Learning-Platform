import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
export class JwtGuard implements CanActivate {
    constructor (private jwtService: JwtService){}

    async canActivate(
        context: ExecutionContext
    ): Promise<boolean>  {
        const request = context.switchToHttp().getRequest();
        const token = this.exractTokenFromHeader(request)

        if(!token) throw new UnauthorizedException ()
            
        try {
            const payload = await this.jwtService.verifyAsync(token, {
               secret: process.env.jwtSecretKey,
            })
            // insert payload into user object
            request['user'] = payload
        } 
        
        catch (error) {
            throw new UnauthorizedException()
        }


        return true;
    }

    private exractTokenFromHeader(request: Request){
        const [type, token] = request.headers.authorization.split(' ')?? [];
        return type == 'Bearer' ? token : undefined
    }

    
}