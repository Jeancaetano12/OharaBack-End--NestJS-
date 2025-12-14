/*
  Warnings:

  - You are about to drop the `_CargoToMembro` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cargos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CargoToMembro" DROP CONSTRAINT "_CargoToMembro_A_fkey";

-- DropForeignKey
ALTER TABLE "_CargoToMembro" DROP CONSTRAINT "_CargoToMembro_B_fkey";

-- DropTable
DROP TABLE "_CargoToMembro";

-- DropTable
DROP TABLE "cargos";

-- CreateTable
CREATE TABLE "Cargos" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorHex" TEXT,
    "position" INTEGER NOT NULL,
    "permissions" TEXT NOT NULL,
    "isManaged" BOOLEAN NOT NULL DEFAULT false,
    "isMentionable" BOOLEAN NOT NULL DEFAULT false,
    "isHoist" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cargos_discordId_key" ON "Cargos"("discordId");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Cargos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "Membros"("id") ON DELETE CASCADE ON UPDATE CASCADE;
