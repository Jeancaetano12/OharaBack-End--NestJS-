-- CreateEnum
CREATE TYPE "tipoEvento" AS ENUM ('COBBLEMON', 'OUTRO');

-- AlterTable
ALTER TABLE "PokemonsCapturados" ADD COLUMN     "eventoId" TEXT;

-- CreateTable
CREATE TABLE "OharaEventos" (
    "id" TEXT NOT NULL,
    "nomeEvento" TEXT NOT NULL,
    "tipoEvento" "tipoEvento" NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataEncerramento" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OharaEventos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OharaEventos_nomeEvento_key" ON "OharaEventos"("nomeEvento");

-- AddForeignKey
ALTER TABLE "PokemonsCapturados" ADD CONSTRAINT "PokemonsCapturados_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "OharaEventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
