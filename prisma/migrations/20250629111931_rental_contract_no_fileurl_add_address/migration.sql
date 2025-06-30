/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `RentalContract` table. All the data in the column will be lost.
  - Added the required column `tenantAddress` to the `RentalContract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RentalContract" DROP COLUMN "fileUrl",
ADD COLUMN     "tenantAddress" TEXT NOT NULL;
