/*
  Warnings:

  - You are about to drop the column `title` on the `Posts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tittle]` on the table `Posts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tittle` to the `Posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Posts" DROP COLUMN "title",
ADD COLUMN     "tittle" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Posts_tittle_key" ON "Posts"("tittle");
