/*
  Warnings:

  - You are about to drop the column `created_at` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `service` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `booking` table. All the data in the column will be lost.
  - Added the required column `service_id` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `request_type` on the `salon_staff_request` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `salon_staff_request` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('booked', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "SalonStaffRequestType" AS ENUM ('profile_update', 'leave');

-- CreateEnum
CREATE TYPE "SalonStaffRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "created_at",
DROP COLUMN "service",
DROP COLUMN "updated_at",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "service_id" TEXT NOT NULL,
ADD COLUMN     "staff_id" TEXT,
ADD COLUMN     "time" TEXT NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "BookingStatus" NOT NULL;

-- AlterTable
ALTER TABLE "salon_staff_request" DROP COLUMN "request_type",
ADD COLUMN     "request_type" "SalonStaffRequestType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "SalonStaffRequestStatus" NOT NULL;
