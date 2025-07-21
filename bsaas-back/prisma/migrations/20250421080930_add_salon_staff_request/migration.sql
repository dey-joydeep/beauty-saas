-- AlterTable
ALTER TABLE "salon_staff" ADD COLUMN     "is_on_leave" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "salon_staff_request" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "request_type" TEXT NOT NULL,
    "leave_from" TIMESTAMP(3),
    "leave_to" TIMESTAMP(3),
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salon_staff_request_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "salon_staff_request" ADD CONSTRAINT "salon_staff_request_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "salon_staff"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
