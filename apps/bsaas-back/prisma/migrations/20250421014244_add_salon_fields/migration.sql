/*
  Warnings:

  - Added the required column `owner_id` to the `salon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salon_id` to the `service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "salon" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "owner_id" TEXT NOT NULL,
ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "service" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "salon_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
