-- CreateEnum
CREATE TYPE "public"."ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('booked', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."SalonStaffRequestType" AS ENUM ('profile_update', 'leave');

-- CreateEnum
CREATE TYPE "public"."SalonStaffRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "public"."business_address" (
    "id" UUID NOT NULL,
    "country_id" UUID NOT NULL,
    "state_id" UUID NOT NULL,
    "city_id" UUID NOT NULL,
    "postal_code" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "building_name" TEXT,
    "floor" TEXT,
    "landmark" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."salon_tenant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "business_address_id" UUID,
    "primary_color" TEXT,
    "secondary_color" TEXT,
    "accent_color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salon_tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT,
    "avatar_url" TEXT,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "salon_tenant_id" UUID,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_role" (
    "user_id" UUID NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "public"."saas_owner" (
    "user_id" UUID NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "managed_tenants" TEXT[],

    CONSTRAINT "saas_owner_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."salon_tenant_staff" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "salon_id" UUID NOT NULL,
    "position" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "hire_date" TIMESTAMP(3),
    "termination_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salon_tenant_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."salon_staff_request" (
    "id" UUID NOT NULL,
    "staff_id" UUID,
    "request_type" "public"."SalonStaffRequestType" NOT NULL,
    "leave_from" TIMESTAMP(3),
    "leave_to" TIMESTAMP(3),
    "reason" TEXT,
    "status" "public"."SalonStaffRequestStatus" NOT NULL,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salon_staff_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "preferred_salon_tenant_id" UUID,
    "loyalty_points" INTEGER NOT NULL DEFAULT 0,
    "last_visit" TIMESTAMP(3),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coupon" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discount" DOUBLE PRECISION NOT NULL,
    "discount_type" TEXT NOT NULL DEFAULT 'PERCENT',
    "max_discount" DOUBLE PRECISION,
    "min_purchase" DOUBLE PRECISION,
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_coupon" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "coupon_id" UUID NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."otp" (
    "id" SERIAL NOT NULL,
    "user_id" UUID,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'VERIFICATION',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."salon" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "business_address_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "average_rating" DECIMAL(3,2) DEFAULT 0.0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "owner_id" UUID NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "salon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."portfolio" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "salon_id" UUID NOT NULL,
    "user_id" UUID,
    "title" TEXT,
    "description" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."portfolio_image" (
    "id" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "image_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."social_account" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointment_service" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "appointment_id" UUID NOT NULL,
    "salon_service_id" UUID NOT NULL,
    "staff_id" UUID,
    "price" DECIMAL(10,2) NOT NULL,
    "original_price" DECIMAL(10,2),
    "discount_amount" DECIMAL(10,2),
    "duration" INTEGER NOT NULL DEFAULT 30,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "appointment_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."theme" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "colors" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."social" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_sale" (
    "id" UUID NOT NULL,
    "salon_tenant_id" UUID NOT NULL,
    "tenant_product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION DEFAULT 0,
    "tax_amount" DOUBLE PRECISION DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "sale_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sold_by_id" UUID NOT NULL,
    "appointment_id" UUID,
    "customer_id" UUID,
    "notes" TEXT,
    "is_refunded" BOOLEAN NOT NULL DEFAULT false,
    "refund_date" TIMESTAMP(3),
    "refund_reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."language" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "native_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_rtl" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "flag_emoji" TEXT,
    "sort_order" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."country" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "iso2" TEXT NOT NULL,
    "iso3" TEXT,
    "phone_code" TEXT,
    "capital" TEXT,
    "currency" TEXT,
    "native" TEXT,
    "emoji" TEXT,
    "emoji_u" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."state" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "state_code" TEXT NOT NULL,
    "country_id" UUID NOT NULL,
    "latitude" TEXT,
    "longitude" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."city" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "state_id" UUID NOT NULL,
    "country_id" UUID NOT NULL,
    "latitude" TEXT,
    "longitude" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."salon_translation" (
    "id" UUID NOT NULL,
    "salon_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salon_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "product_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "service_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sku_pattern" TEXT,
    "barcode_type" TEXT,
    "metadata" JSONB,

    CONSTRAINT "global_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_service" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category_id" UUID NOT NULL,
    "duration" INTEGER,
    "price" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "global_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_tenant_id" UUID NOT NULL,
    "customer_id" UUID,
    "staff_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "customer_notes" TEXT,
    "internal_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMP(3),
    "cancelled_by" UUID,
    "cancellation_reason" TEXT,
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "customer_email" TEXT,

    CONSTRAINT "appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tenant_product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_tenant_id" UUID NOT NULL,
    "global_product_id" UUID,
    "product_category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "cost_price" DECIMAL(10,2),
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "barcode" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_taxable" BOOLEAN NOT NULL DEFAULT true,
    "tax_rate" DECIMAL(5,2),
    "weight" DECIMAL(10,2),
    "weight_unit" TEXT DEFAULT 'g',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."salon_service" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "salon_id" UUID NOT NULL,
    "global_service_id" UUID,
    "service_category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "cost_price" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "salon_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tenant_salon_service" (
    "tenant_id" UUID NOT NULL,
    "salon_service_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed_at" TIMESTAMP(3),
    "last_active_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_salon_service_pkey" PRIMARY KEY ("tenant_id","salon_service_id")
);

-- CreateTable
CREATE TABLE "public"."salon_service_review" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "appointment_service_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "response" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "customer_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "salon_service_id" UUID NOT NULL,
    "staff_id" UUID,

    CONSTRAINT "salon_service_review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "business_address_country_id_idx" ON "public"."business_address"("country_id");

-- CreateIndex
CREATE INDEX "business_address_state_id_idx" ON "public"."business_address"("state_id");

-- CreateIndex
CREATE INDEX "business_address_city_id_idx" ON "public"."business_address"("city_id");

-- CreateIndex
CREATE UNIQUE INDEX "salon_tenant_email_key" ON "public"."salon_tenant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "salon_tenant_business_address_id_key" ON "public"."salon_tenant"("business_address_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "public"."role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "salon_tenant_staff_user_id_key" ON "public"."salon_tenant_staff"("user_id");

-- CreateIndex
CREATE INDEX "salon_tenant_staff_user_id_idx" ON "public"."salon_tenant_staff"("user_id");

-- CreateIndex
CREATE INDEX "salon_tenant_staff_salon_id_idx" ON "public"."salon_tenant_staff"("salon_id");

-- CreateIndex
CREATE UNIQUE INDEX "salon_tenant_staff_user_id_salon_id_key" ON "public"."salon_tenant_staff"("user_id", "salon_id");

-- CreateIndex
CREATE UNIQUE INDEX "salon_tenant_staff_id_key" ON "public"."salon_tenant_staff"("id");

-- CreateIndex
CREATE INDEX "salon_staff_request_staff_id_idx" ON "public"."salon_staff_request"("staff_id");

-- CreateIndex
CREATE INDEX "salon_staff_request_status_idx" ON "public"."salon_staff_request"("status");

-- CreateIndex
CREATE UNIQUE INDEX "customer_user_id_key" ON "public"."customer"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_code_key" ON "public"."coupon"("code");

-- CreateIndex
CREATE INDEX "coupon_code_idx" ON "public"."coupon"("code");

-- CreateIndex
CREATE INDEX "coupon_tenant_id_idx" ON "public"."coupon"("tenant_id");

-- CreateIndex
CREATE INDEX "coupon_is_active_idx" ON "public"."coupon"("is_active");

-- CreateIndex
CREATE INDEX "user_coupon_user_id_idx" ON "public"."user_coupon"("user_id");

-- CreateIndex
CREATE INDEX "user_coupon_coupon_id_idx" ON "public"."user_coupon"("coupon_id");

-- CreateIndex
CREATE INDEX "user_coupon_is_used_idx" ON "public"."user_coupon"("is_used");

-- CreateIndex
CREATE UNIQUE INDEX "user_coupon_user_id_coupon_id_key" ON "public"."user_coupon"("user_id", "coupon_id");

-- CreateIndex
CREATE INDEX "otp_user_id_idx" ON "public"."otp"("user_id");

-- CreateIndex
CREATE INDEX "otp_code_idx" ON "public"."otp"("code");

-- CreateIndex
CREATE INDEX "otp_is_used_idx" ON "public"."otp"("is_used");

-- CreateIndex
CREATE INDEX "otp_expires_at_idx" ON "public"."otp"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "salon_business_address_id_key" ON "public"."salon"("business_address_id");

-- CreateIndex
CREATE UNIQUE INDEX "salon_slug_key" ON "public"."salon"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "salon_owner_id_key" ON "public"."salon"("owner_id");

-- CreateIndex
CREATE INDEX "salon_tenant_id_idx" ON "public"."salon"("tenant_id");

-- CreateIndex
CREATE INDEX "salon_is_active_idx" ON "public"."salon"("is_active");

-- CreateIndex
CREATE INDEX "salon_is_verified_idx" ON "public"."salon"("is_verified");

-- CreateIndex
CREATE INDEX "salon_average_rating_idx" ON "public"."salon"("average_rating");

-- CreateIndex
CREATE INDEX "salon_review_count_idx" ON "public"."salon"("review_count");

-- CreateIndex
CREATE INDEX "portfolio_tenant_id_idx" ON "public"."portfolio"("tenant_id");

-- CreateIndex
CREATE INDEX "portfolio_salon_id_idx" ON "public"."portfolio"("salon_id");

-- CreateIndex
CREATE INDEX "portfolio_user_id_idx" ON "public"."portfolio"("user_id");

-- CreateIndex
CREATE INDEX "portfolio_is_featured_idx" ON "public"."portfolio"("is_featured");

-- CreateIndex
CREATE INDEX "portfolio_is_active_idx" ON "public"."portfolio"("is_active");

-- CreateIndex
CREATE INDEX "portfolio_order_idx" ON "public"."portfolio"("order");

-- CreateIndex
CREATE UNIQUE INDEX "social_account_provider_provider_user_id_key" ON "public"."social_account"("provider", "provider_user_id");

-- CreateIndex
CREATE INDEX "appointment_service_appointment_id_idx" ON "public"."appointment_service"("appointment_id");

-- CreateIndex
CREATE INDEX "appointment_service_salon_service_id_idx" ON "public"."appointment_service"("salon_service_id");

-- CreateIndex
CREATE INDEX "appointment_service_staff_id_idx" ON "public"."appointment_service"("staff_id");

-- CreateIndex
CREATE INDEX "appointment_service_status_idx" ON "public"."appointment_service"("status");

-- CreateIndex
CREATE INDEX "appointment_service_start_time_idx" ON "public"."appointment_service"("start_time");

-- CreateIndex
CREATE INDEX "theme_is_active_idx" ON "public"."theme"("is_active");

-- CreateIndex
CREATE INDEX "theme_is_default_idx" ON "public"."theme"("is_default");

-- CreateIndex
CREATE INDEX "social_user_id_idx" ON "public"."social"("user_id");

-- CreateIndex
CREATE INDEX "social_platform_idx" ON "public"."social"("platform");

-- CreateIndex
CREATE INDEX "social_is_active_idx" ON "public"."social"("is_active");

-- CreateIndex
CREATE INDEX "social_is_primary_idx" ON "public"."social"("is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "social_platform_handle_key" ON "public"."social"("platform", "handle");

-- CreateIndex
CREATE INDEX "product_sale_sale_date_idx" ON "public"."product_sale"("sale_date");

-- CreateIndex
CREATE INDEX "product_sale_tenant_product_id_idx" ON "public"."product_sale"("tenant_product_id");

-- CreateIndex
CREATE INDEX "product_sale_salon_tenant_id_idx" ON "public"."product_sale"("salon_tenant_id");

-- CreateIndex
CREATE INDEX "product_sale_appointment_id_idx" ON "public"."product_sale"("appointment_id");

-- CreateIndex
CREATE INDEX "product_sale_customer_id_idx" ON "public"."product_sale"("customer_id");

-- CreateIndex
CREATE INDEX "product_sale_sold_by_id_idx" ON "public"."product_sale"("sold_by_id");

-- CreateIndex
CREATE INDEX "product_sale_is_refunded_idx" ON "public"."product_sale"("is_refunded");

-- CreateIndex
CREATE INDEX "language_code_idx" ON "public"."language"("code");

-- CreateIndex
CREATE INDEX "language_is_active_idx" ON "public"."language"("is_active");

-- CreateIndex
CREATE INDEX "language_sort_order_idx" ON "public"."language"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "language_code_key" ON "public"."language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "country_iso2_key" ON "public"."country"("iso2");

-- CreateIndex
CREATE UNIQUE INDEX "country_iso3_key" ON "public"."country"("iso3");

-- CreateIndex
CREATE UNIQUE INDEX "state_country_id_state_code_key" ON "public"."state"("country_id", "state_code");

-- CreateIndex
CREATE INDEX "city_state_id_idx" ON "public"."city"("state_id");

-- CreateIndex
CREATE INDEX "city_country_id_idx" ON "public"."city"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "salon_translation_salon_id_language_id_key" ON "public"."salon_translation"("salon_id", "language_id");

-- CreateIndex
CREATE INDEX "product_category_is_active_idx" ON "public"."product_category"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "product_category_name_key" ON "public"."product_category"("name");

-- CreateIndex
CREATE INDEX "service_category_is_active_idx" ON "public"."service_category"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "service_category_name_key" ON "public"."service_category"("name");

-- CreateIndex
CREATE INDEX "idx_global_product_category" ON "public"."global_product"("category_id");

-- CreateIndex
CREATE INDEX "idx_global_product_active" ON "public"."global_product"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "global_product_name_category_id_key" ON "public"."global_product"("name", "category_id");

-- CreateIndex
CREATE INDEX "idx_global_service_category" ON "public"."global_service"("category_id");

-- CreateIndex
CREATE INDEX "idx_global_service_active" ON "public"."global_service"("is_active");

-- CreateIndex
CREATE INDEX "idx_appointment_tenant" ON "public"."appointment"("salon_tenant_id");

-- CreateIndex
CREATE INDEX "idx_appointment_customer" ON "public"."appointment"("customer_id");

-- CreateIndex
CREATE INDEX "idx_appointment_staff" ON "public"."appointment"("staff_id");

-- CreateIndex
CREATE INDEX "idx_appointment_status" ON "public"."appointment"("status");

-- CreateIndex
CREATE INDEX "idx_appointment_start_time" ON "public"."appointment"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_product_sku_key" ON "public"."tenant_product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_product_barcode_key" ON "public"."tenant_product"("barcode");

-- CreateIndex
CREATE INDEX "idx_tenant_product_tenant" ON "public"."tenant_product"("salon_tenant_id");

-- CreateIndex
CREATE INDEX "idx_tenant_product_global" ON "public"."tenant_product"("global_product_id");

-- CreateIndex
CREATE INDEX "idx_tenant_product_active" ON "public"."tenant_product"("is_active");

-- CreateIndex
CREATE INDEX "idx_tenant_product_sku" ON "public"."tenant_product"("sku");

-- CreateIndex
CREATE INDEX "idx_tenant_product_barcode" ON "public"."tenant_product"("barcode");

-- CreateIndex
CREATE INDEX "idx_salon_service_salon" ON "public"."salon_service"("salon_id");

-- CreateIndex
CREATE INDEX "idx_salon_service_category" ON "public"."salon_service"("service_category_id");

-- CreateIndex
CREATE INDEX "idx_salon_service_active" ON "public"."salon_service"("is_active");

-- CreateIndex
CREATE INDEX "idx_salon_service_global" ON "public"."salon_service"("global_service_id");

-- CreateIndex
CREATE INDEX "idx_tenant_salon_service_active" ON "public"."tenant_salon_service"("is_active");

-- CreateIndex
CREATE INDEX "idx_tenant_salon_service_added" ON "public"."tenant_salon_service"("added_at");

-- CreateIndex
CREATE INDEX "salon_service_review_customer_id_idx" ON "public"."salon_service_review"("customer_id");

-- CreateIndex
CREATE INDEX "salon_service_review_tenant_id_salon_service_id_idx" ON "public"."salon_service_review"("tenant_id", "salon_service_id");

-- CreateIndex
CREATE INDEX "salon_service_review_staff_id_idx" ON "public"."salon_service_review"("staff_id");

-- CreateIndex
CREATE INDEX "salon_service_review_status_idx" ON "public"."salon_service_review"("status");

-- CreateIndex
CREATE INDEX "salon_service_review_is_approved_idx" ON "public"."salon_service_review"("is_approved");

-- CreateIndex
CREATE INDEX "salon_service_review_is_featured_idx" ON "public"."salon_service_review"("is_featured");

-- CreateIndex
CREATE INDEX "salon_service_review_created_at_idx" ON "public"."salon_service_review"("created_at");

-- AddForeignKey
ALTER TABLE "public"."business_address" ADD CONSTRAINT "business_address_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."business_address" ADD CONSTRAINT "business_address_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "public"."state"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."business_address" ADD CONSTRAINT "business_address_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_tenant" ADD CONSTRAINT "salon_tenant_business_address_id_fkey" FOREIGN KEY ("business_address_id") REFERENCES "public"."business_address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_salon_tenant_id_fkey" FOREIGN KEY ("salon_tenant_id") REFERENCES "public"."salon_tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saas_owner" ADD CONSTRAINT "saas_owner_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_tenant_staff" ADD CONSTRAINT "salon_tenant_staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_tenant_staff" ADD CONSTRAINT "salon_tenant_staff_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "public"."salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_staff_request" ADD CONSTRAINT "salon_staff_request_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."salon_tenant_staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer" ADD CONSTRAINT "customer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer" ADD CONSTRAINT "customer_preferred_salon_tenant_id_fkey" FOREIGN KEY ("preferred_salon_tenant_id") REFERENCES "public"."salon_tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupon" ADD CONSTRAINT "coupon_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."salon_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_coupon" ADD CONSTRAINT "user_coupon_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_coupon" ADD CONSTRAINT "user_coupon_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_coupon" ADD CONSTRAINT "user_coupon_customer_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."customer"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."otp" ADD CONSTRAINT "otp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon" ADD CONSTRAINT "salon_business_address_id_fkey" FOREIGN KEY ("business_address_id") REFERENCES "public"."business_address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon" ADD CONSTRAINT "salon_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon" ADD CONSTRAINT "salon_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."salon_tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."portfolio" ADD CONSTRAINT "portfolio_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."salon_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."portfolio" ADD CONSTRAINT "portfolio_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "public"."salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."portfolio" ADD CONSTRAINT "portfolio_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."portfolio_image" ADD CONSTRAINT "portfolio_image_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."social_account" ADD CONSTRAINT "social_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment_service" ADD CONSTRAINT "appointment_service_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment_service" ADD CONSTRAINT "appointment_service_salon_service_id_fkey" FOREIGN KEY ("salon_service_id") REFERENCES "public"."salon_service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment_service" ADD CONSTRAINT "appointment_service_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."salon_tenant_staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."social" ADD CONSTRAINT "social_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_sale" ADD CONSTRAINT "product_sale_salon_tenant_id_fkey" FOREIGN KEY ("salon_tenant_id") REFERENCES "public"."salon_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_sale" ADD CONSTRAINT "product_sale_tenant_product_id_fkey" FOREIGN KEY ("tenant_product_id") REFERENCES "public"."tenant_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_sale" ADD CONSTRAINT "product_sale_sold_by_id_fkey" FOREIGN KEY ("sold_by_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_sale" ADD CONSTRAINT "product_sale_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_sale" ADD CONSTRAINT "product_sale_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_sale" ADD CONSTRAINT "product_sale_customer_ref_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."state" ADD CONSTRAINT "state_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."city" ADD CONSTRAINT "city_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "public"."state"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."city" ADD CONSTRAINT "city_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_translation" ADD CONSTRAINT "salon_translation_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "public"."salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_translation" ADD CONSTRAINT "salon_translation_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."global_product" ADD CONSTRAINT "global_product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."global_service" ADD CONSTRAINT "global_service_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."service_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_salon_tenant_id_fkey" FOREIGN KEY ("salon_tenant_id") REFERENCES "public"."salon_tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_customer_ref_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."salon_tenant_staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tenant_product" ADD CONSTRAINT "tenant_product_salon_tenant_id_fkey" FOREIGN KEY ("salon_tenant_id") REFERENCES "public"."salon_tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tenant_product" ADD CONSTRAINT "tenant_product_global_product_id_fkey" FOREIGN KEY ("global_product_id") REFERENCES "public"."global_product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tenant_product" ADD CONSTRAINT "tenant_product_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_service" ADD CONSTRAINT "salon_service_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "public"."salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_service" ADD CONSTRAINT "salon_service_service_category_id_fkey" FOREIGN KEY ("service_category_id") REFERENCES "public"."service_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_service" ADD CONSTRAINT "salon_service_global_service_id_fkey" FOREIGN KEY ("global_service_id") REFERENCES "public"."global_service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tenant_salon_service" ADD CONSTRAINT "tenant_salon_service_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."salon_tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tenant_salon_service" ADD CONSTRAINT "tenant_salon_service_salon_service_id_fkey" FOREIGN KEY ("salon_service_id") REFERENCES "public"."salon_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_service_review" ADD CONSTRAINT "salon_service_review_appointment_service_id_fkey" FOREIGN KEY ("appointment_service_id") REFERENCES "public"."appointment_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_service_review" ADD CONSTRAINT "salon_service_review_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_service_review" ADD CONSTRAINT "salon_service_review_tenant_id_salon_service_id_fkey" FOREIGN KEY ("tenant_id", "salon_service_id") REFERENCES "public"."tenant_salon_service"("tenant_id", "salon_service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_service_review" ADD CONSTRAINT "salon_service_review_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."salon_tenant_staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
