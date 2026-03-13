import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-spotify';
import { AuthService } from './auth.service';

@Injectable()
export class SpotifyStrategy extends PassportStrategy(Strategy, 'spotify') {
    private readonly logger = new Logger(SpotifyStrategy.name);

    constructor(private authService: AuthService) {

        super({
            clientID: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            callbackURL: process.env.SPOTIFY_CALLBACK_URL!,
            scope: ['user-read-email', 'user-read-private', 'user-follow-read', 'user-top-read'],
            passReqToCallback: true, // Passa o req para o validate, necessário para vincular ao usuário logado
        });
    }

    async validate(
        req: any,
        accessToken: string,
        refreshToken: string, // deixa aqui pra usar depois
        ...args: any[]
    ): Promise<any> {

        const profile = args.find(arg =>
            arg && 
            typeof arg === 'object' && arg.id && arg.provider === 'spotify'
        );

        if (!profile) {
            this.logger.error('Perfil do Spotify não encontrado na resposta da autenticação. Vinculação cancelada.');
            return null;
        }

        const jwtToken = req.query.state;

        this.logger.log(`Perfil do Spotify vinculado, ID: ${profile.id}, Nome: ${profile.displayName}`);
        return this.authService.linkSpotifyAccount(jwtToken, profile, accessToken);
    }
}