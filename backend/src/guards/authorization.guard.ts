import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_KEY } from "src/decorators/roles.decorator";

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private reflector: Reflector){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try{
            const request = context.switchToHttp().getRequest()
            const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
                context.getClass(),
                context.getHandler()
            ]);
            const userRole = request.user.role
            return (Object.values(requiredRoles).indexOf(userRole) > -1) ? true : false
        }catch{
            throw new UnauthorizedException("Unauthorized gwa authorization shaklak nseet t7ot @Roles")
        }
    }
    
}