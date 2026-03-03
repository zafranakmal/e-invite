/*
  Warnings:

  - You are about to drop the `RegistryItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "RegistryItem";

-- CreateTable
CREATE TABLE "registryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "registryItem_pkey" PRIMARY KEY ("id")
);
