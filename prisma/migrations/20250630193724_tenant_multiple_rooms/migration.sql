/*
  Warnings:

  - You are about to drop the column `roomId` on the `Tenant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_roomId_fkey";

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "roomId";

-- CreateTable
CREATE TABLE "TenantRoom" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "TenantRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantRoom_tenantId_roomId_key" ON "TenantRoom"("tenantId", "roomId");

-- AddForeignKey
ALTER TABLE "TenantRoom" ADD CONSTRAINT "TenantRoom_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantRoom" ADD CONSTRAINT "TenantRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
