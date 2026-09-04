/*
  Warnings:

  - You are about to drop the column `sectionId` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('UPCOMING', 'IN_PROGRESS', 'DONE');

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_boardId_fkey";

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "sectionId",
ADD COLUMN     "status" "IssueStatus" NOT NULL DEFAULT 'UPCOMING';

-- DropTable
DROP TABLE "Section";
