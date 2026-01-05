-- CreateTable
CREATE TABLE "Perfis" (
    "id" TEXT NOT NULL,
    "bio" TEXT,
    "website" TEXT,
    "birthDate" TIMESTAMP(3),
    "customTheme" TEXT,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Perfis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conexoes" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Conexoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Perfis_userId_key" ON "Perfis"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Conexoes_provider_providerId_key" ON "Conexoes"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "Perfis" ADD CONSTRAINT "Perfis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conexoes" ADD CONSTRAINT "Conexoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
