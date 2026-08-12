import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class MembrosCronService {
    private readonly logger = new Logger(MembrosCronService.name);

    @Cron('0 2 * * 0') // Executa todo domingo às 02:00 AM
    async sincronizarDados() {
        this.logger.warn(`[CRON] Tarefa de sincronização solicitada ao bot.`)
        try {
            const solicitacao = await fetch(`${process.env.BOT_URL}/sincronizar-dados`,
                {
                    method: "POST",
                    headers: { 'Content-type': 'application/json' }
                }
            )

            if (solicitacao.ok) {
                this.logger.log(`[CRON] Tarefa de sincronização concluída com sucesso.`)
            } else {
                this.logger.error(`[CRON] Falha ao sincronizar dados no bot. Status: ${solicitacao.status} - ${solicitacao.statusText}`)
            }
        } catch (error) {
            this.logger.error(`[CRON] Erro ao sincronizar dados.`, error)
        }
    }
}