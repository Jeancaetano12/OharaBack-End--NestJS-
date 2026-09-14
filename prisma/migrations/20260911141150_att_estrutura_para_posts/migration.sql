/*
  Warnings:

  - Added the required column `authorId` to the `OharaEventos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OharaEventos" ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "media" JSONB;

-- AlterTable
ALTER TABLE "Posts" ADD COLUMN     "title" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "OharaEventos" ADD CONSTRAINT "OharaEventos_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Membros"("id") ON DELETE CASCADE ON UPDATE CASCADE;
