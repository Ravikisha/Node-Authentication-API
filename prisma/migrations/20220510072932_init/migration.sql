/*
  Warnings:

  - You are about to drop the column `completeAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "completeAt" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "completeAt";
