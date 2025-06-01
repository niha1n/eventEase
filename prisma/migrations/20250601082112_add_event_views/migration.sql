-- CreateTable
CREATE TABLE "EventView" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'direct',

    CONSTRAINT "EventView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventView_eventId_idx" ON "EventView"("eventId");

-- CreateIndex
CREATE INDEX "EventView_createdAt_idx" ON "EventView"("createdAt");

-- AddForeignKey
ALTER TABLE "EventView" ADD CONSTRAINT "EventView_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
