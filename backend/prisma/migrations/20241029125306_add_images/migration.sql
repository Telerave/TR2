/*
  Warnings:

  - You are about to drop the column `artist` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `audioFile` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `chromaMean` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `imageFile` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `spectralCentroidMean` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `tempo` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[filename]` on the table `Track` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `filename` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_userId_fkey";

-- DropIndex
DROP INDEX "Track_title_artist_idx";

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "artist",
DROP COLUMN "audioFile",
DROP COLUMN "chromaMean",
DROP COLUMN "createdAt",
DROP COLUMN "duration",
DROP COLUMN "imageFile",
DROP COLUMN "spectralCentroidMean",
DROP COLUMN "tempo",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "filename" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_filename_key" ON "Image"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "Track_filename_key" ON "Track"("filename");
