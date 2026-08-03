-- A gift may now be reserved by more than one guest, so itemId is no longer
-- unique on Reservation. Dropping a unique index never loses rows.
DROP INDEX "Reservation_itemId_key";

-- The FK lookup still wants an index, just a non-unique one.
CREATE INDEX "Reservation_itemId_idx" ON "Reservation"("itemId");

-- Per-gift cap on how many guests may reserve it. Existing rows default to 1,
-- which preserves today's one-reservation-per-gift behaviour.
ALTER TABLE "RegistryItem" ADD COLUMN "maxReservations" INTEGER NOT NULL DEFAULT 1;
