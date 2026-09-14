-- DropForeignKey
ALTER TABLE "Comentarios" DROP CONSTRAINT "Comentarios_authorId_fkey";

-- DropForeignKey
ALTER TABLE "OharaEventos" DROP CONSTRAINT "OharaEventos_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Posts" DROP CONSTRAINT "Posts_authorId_fkey";

-- AddForeignKey
ALTER TABLE "OharaEventos" ADD CONSTRAINT "OharaEventos_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Membros"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Membros"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentarios" ADD CONSTRAINT "Comentarios_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Membros"("discordId") ON DELETE CASCADE ON UPDATE CASCADE;
