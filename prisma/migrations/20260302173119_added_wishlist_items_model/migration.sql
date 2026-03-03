-- CreateTable
CREATE TABLE "ReservationItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "ReservationItem_pkey" PRIMARY KEY ("id")
);
