import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DiscordAuthGuard extends AuthGuard('discord') {
  private readonly Logger = new Logger(DiscordAuthGuard.name);
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const response = context.switchToHttp().getResponse();

    return user;
  }
}