/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Membros` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Membros" ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Membros_email_key" ON "Membros"("email");
