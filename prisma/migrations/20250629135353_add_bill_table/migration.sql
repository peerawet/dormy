-- CreateTable
CREATE TABLE "Bill" (
    "id" SERIAL NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL,
    "tenantName" TEXT NOT NULL,
    "water" INTEGER NOT NULL,
    "electric" INTEGER NOT NULL,
    "common" INTEGER NOT NULL,
    "rent" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
