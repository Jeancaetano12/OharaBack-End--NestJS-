-- CreateTable
CREATE TABLE "Membros" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "globalName" TEXT,
    "serverNickName" TEXT,
    "avatarUrl" TEXT,
    "serverAvatarUrl" TEXT,
    "bannerUrl" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "colorHex" TEXT,
    "accountCreatedAt" TIMESTAMP(3) NOT NULL,
    "joinedServerAt" TIMESTAMP(3),
    "premiumSince" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargos" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorHex" TEXT,
    "position" INTEGER NOT NULL,
    "permissions" TEXT NOT NULL,
    "isManaged" BOOLEAN NOT NULL DEFAULT false,
    "isMentionable" BOOLEAN NOT NULL DEFAULT false,
    "isHoist" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CargoToMembro" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CargoToMembro_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Membros_discordId_key" ON "Membros"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "cargos_discordId_key" ON "cargos"("discordId");

-- CreateIndex
CREATE INDEX "_CargoToMembro_B_index" ON "_CargoToMembro"("B");

-- AddForeignKey
ALTER TABLE "_CargoToMembro" ADD CONSTRAINT "_CargoToMembro_A_fkey" FOREIGN KEY ("A") REFERENCES "cargos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CargoToMembro" ADD CONSTRAINT "_CargoToMembro_B_fkey" FOREIGN KEY ("B") REFERENCES "Membros"("id") ON DELETE CASCADE ON UPDATE CASCADE;
