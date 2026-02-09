import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCargoDto } from './dto/create-cargo.dto';

@Injectable()
export class CargosService {
    private readonly logger = new Logger(CargosService.name);
    constructor(private prisma: PrismaService) {}

    async syncRoles(createCargoDto: CreateCargoDto[]) {
        this.logger.log(`Sincronizando ${createCargoDto.length} cargos...`);
        try {
            const transaction = createCargoDto.map((cargo) =>
                this.prisma.role.upsert({
                    where: { discordId: cargo.discordId },
                    update: {
                        name: cargo.name,
                        colorHex: cargo.colorHex,
                        position: cargo.position,
                        permissions: cargo.permissions,
                        isManaged: cargo.isManaged,
                        isMentionable: cargo.isMentionable,
                        isHoist: cargo.isHoist,
                    },

                    create: {
                        discordId: cargo.discordId,
                        name: cargo.name,
                        colorHex: cargo.colorHex,
                        position: cargo.position,
                        permissions: cargo.permissions,
                        isManaged: cargo.isManaged,
                        isMentionable: cargo.isMentionable,
                        isHoist: cargo.isHoist,
                    }
                }),
            );
            this.logger.log(`Cargos sincronizados com sucesso.`);
            return this.prisma.$transaction(transaction);    
        }   catch (error) {
            this.logger.error(`Erro ao sincronizar cargos: ${console.error(error)}`);
            throw new Error(`Erro ao sincronizar cargos`);
        }
    }
}