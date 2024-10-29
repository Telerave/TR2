/*
  Warnings:

  - You are about to drop the column `album` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Track` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Track" DROP COLUMN "album",
DROP COLUMN "fileUrl",
ADD COLUMN     "audioFile" TEXT,
ADD COLUMN     "chromaMean" DOUBLE PRECISION,
ADD COLUMN     "imageFile" TEXT,
ADD COLUMN     "spectralCentroidMean" DOUBLE PRECISION,
ADD COLUMN     "tempo" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Track_title_artist_idx" ON "Track"("title", "artist");
