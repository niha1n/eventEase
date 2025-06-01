-- CreateEnum
CREATE TYPE "RSVPStatus" AS ENUM ('CONFIRMED', 'PENDING', 'DECLINED');

-- AlterTable
ALTER TABLE "RSVP" ADD COLUMN     "status" "RSVPStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "RSVP_status_idx" ON "RSVP"("status");
