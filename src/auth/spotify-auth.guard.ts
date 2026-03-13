import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SpotifyAuthGuard extends AuthGuard('spotify') {

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        return user;
    }
}