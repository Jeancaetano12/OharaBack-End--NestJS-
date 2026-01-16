/*
  Warnings:

  - You are about to drop the column `website` on the `Perfis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Perfis" DROP COLUMN "website",
ADD COLUMN     "socialLinks" JSONB;
