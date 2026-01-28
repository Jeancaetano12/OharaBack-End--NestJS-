-- DropForeignKey
ALTER TABLE "Perfis" DROP CONSTRAINT "Perfis_userId_fkey";

-- AddForeignKey
ALTER TABLE "Perfis" ADD CONSTRAINT "Perfis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membros"("id") ON DELETE CASCADE ON UPDATE CASCADE;
