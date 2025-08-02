-- Rename the table
ALTER TABLE "salon_staff" RENAME TO "salon_tenant_staff";

-- Rename the primary key constraint if it exists
ALTER TABLE "salon_tenant_staff" RENAME CONSTRAINT "salon_staff_pkey" TO "salon_tenant_staff_pkey";

-- Rename foreign key constraints
DO $$
BEGIN
    -- Check if the constraint exists before trying to rename it
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'salon_staff_salon_id_fkey') THEN
        EXECUTE 'ALTER TABLE "salon_tenant_staff" RENAME CONSTRAINT "salon_staff_salon_id_fkey" TO "salon_tenant_staff_salon_id_fkey";';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'salon_staff_user_id_fkey') THEN
        EXECUTE 'ALTER TABLE "salon_tenant_staff" RENAME CONSTRAINT "salon_staff_user_id_fkey" TO "salon_tenant_staff_user_id_fkey";';
    END IF;
    
    -- Update any indexes
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'salon_staff_salon_id_idx') THEN
        EXECUTE 'ALTER INDEX "salon_staff_salon_id_idx" RENAME TO "salon_tenant_staff_salon_id_idx";';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'salon_staff_user_id_idx') THEN
        EXECUTE 'ALTER INDEX "salon_staff_user_id_idx" RENAME TO "salon_tenant_staff_user_id_idx";';
    END IF;
    
    -- Update any sequences
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'salon_staff_id_seq') THEN
        EXECUTE 'ALTER SEQUENCE "salon_staff_id_seq" RENAME TO "salon_tenant_staff_id_seq";';
    END IF;
END
$$;
