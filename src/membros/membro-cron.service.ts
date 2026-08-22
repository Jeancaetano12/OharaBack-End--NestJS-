import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class MembrosCronService {
    private readonly logger = new Logger(MembrosCronService.name);

    @Cron(process.env.NODE_ENV === 'production' ? '0 2 * * 0' : '*/15 * * * *') // Executa todo domingo às 02:00 AM em produção, e a cada 15 minutos em dev
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
                await this.enviarAlertaWhatsapp(`✅ [CRON] Tarefa de sincronização de membros concluída com sucesso no bot!`)
            } else {
                this.logger.error(`[CRON] Falha ao sincronizar dados no bot. Status: ${solicitacao.status} - ${solicitacao.statusText}`)
                await this.enviarAlertaWhatsapp(`❌ [CRON] Falha ao sincronizar dados no bot. Status: ${solicitacao.status} - ${solicitacao.statusText}`)
            }
        } catch (error) {
            this.logger.error(`[CRON] Erro ao sincronizar dados.`, error)
            await this.enviarAlertaWhatsapp(`🚨 [CRON] Erro crítico ao tentar sincronizar dados com o bot.`)
        }
    }

    private async enviarAlertaWhatsapp(mensagem: string) {
        try {
            const apiUrl = process.env.EVOLUTION_API_URL;
            const apiKey = process.env.EVOLUTION_API_KEY;
            const nomeInstancia = process.env.EVOLUTION_API_INSTANCE;
            const numeroCelular = process.env.WHATSAPP_NUMBER_ALERT;

            if (!apiUrl || !apiKey || !nomeInstancia || !numeroCelular) {
                this.logger.warn(`[CRON] Variáveis de ambiente da Evolution API não configuradas corretamente. Alerta ignorado.`);
                return;
            }

            const response = await fetch(`${apiUrl}/message/sendText/${nomeInstancia}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apiKey
                },
                body: JSON.stringify({
                    number: numeroCelular,
                    text: mensagem
                })
            });

            if (!response.ok) {
                this.logger.error(`[CRON] Falha ao enviar alerta no WhatsApp via Evolution API. Status: ${response.status}`);
            }
        } catch (error) {
            this.logger.error(`[CRON] Erro interno ao tentar enviar alerta no WhatsApp.`, error);
        }
    }
}