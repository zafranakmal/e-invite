/*
  Warnings:

  - You are about to drop the `registryItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "registryItem";

-- CreateTable
CREATE TABLE "RegistryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistryItem_pkey" PRIMARY KEY ("id")
);
