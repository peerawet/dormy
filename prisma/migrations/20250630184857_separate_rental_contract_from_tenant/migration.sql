/*
  Warnings:

  - You are about to drop the column `endDate` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Tenant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_roomId_fkey";

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "endDate",
DROP COLUMN "roomId",
DROP COLUMN "startDate";

-- CreateTable
CREATE TABLE "RentalContract" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "RentalContract_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RentalContract" ADD CONSTRAINT "RentalContract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalContract" ADD CONSTRAINT "RentalContract_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
