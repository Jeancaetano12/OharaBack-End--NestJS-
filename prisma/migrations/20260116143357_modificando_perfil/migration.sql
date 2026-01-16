/*
  Warnings:

  - You are about to drop the column `customTheme` on the `Perfis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Perfis" DROP COLUMN "customTheme",
ADD COLUMN     "AvatarSite" TEXT,
ADD COLUMN     "BannerSite" TEXT;
