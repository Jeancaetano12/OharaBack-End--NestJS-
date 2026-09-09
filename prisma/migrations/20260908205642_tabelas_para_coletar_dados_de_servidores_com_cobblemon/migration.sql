/*
  Warnings:

  - You are about to drop the column `accessToken` on the `Conexoes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conexoes" DROP COLUMN "accessToken";

-- CreateTable
CREATE TABLE "PokemonsCapturados" (
    "id" SERIAL NOT NULL,
    "playerUuid" TEXT NOT NULL,
    "pokemon" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "pokebola" TEXT NOT NULL,
    "tipos" TEXT[],
    "capturadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PokemonsCapturados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContasMinecraft" (
    "uuid" TEXT NOT NULL,
    "userId" TEXT,
    "nickAtual" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContasMinecraft_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContasMinecraft_userId_key" ON "ContasMinecraft"("userId");

-- AddForeignKey
ALTER TABLE "PokemonsCapturados" ADD CONSTRAINT "PokemonsCapturados_playerUuid_fkey" FOREIGN KEY ("playerUuid") REFERENCES "ContasMinecraft"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContasMinecraft" ADD CONSTRAINT "ContasMinecraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membros"("id") ON DELETE CASCADE ON UPDATE CASCADE;
