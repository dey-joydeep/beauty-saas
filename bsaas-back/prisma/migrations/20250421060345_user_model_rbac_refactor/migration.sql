/*
  Warnings:

  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.
  - The primary key for the `user_role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `user_role` table. All the data in the column will be lost.
  - Made the column `address` on table `salon` required. This step will fail if there are existing NULL values in that column.
  - Made the column `latitude` on table `salon` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longitude` on table `salon` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `password_hash` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_role_user_id_role_id_key";

-- AlterTable
ALTER TABLE "salon" ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "password",
ADD COLUMN     "password_hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_id", "role_id");

-- CreateTable
CREATE TABLE "saas_owner" (
    "user_id" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "managed_tenants" TEXT[],

    CONSTRAINT "saas_owner_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "salon_staff" (
    "user_id" TEXT NOT NULL,
    "salon_id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "hired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salon_staff_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "customer" (
    "user_id" TEXT NOT NULL,
    "loyalty_points" INTEGER NOT NULL DEFAULT 0,
    "preferred_salon_id" TEXT,
    "registered_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "saas_owner" ADD CONSTRAINT "saas_owner_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salon_staff" ADD CONSTRAINT "salon_staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salon_staff" ADD CONSTRAINT "salon_staff_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
