/*
  Warnings:

  - The primary key for the `PortfolioImage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `PortfolioImage` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `PortfolioImage` table. All the data in the column will be lost.
  - You are about to drop the column `image_path` on the `PortfolioImage` table. All the data in the column will be lost.
  - You are about to drop the column `portfolio_id` on the `PortfolioImage` table. All the data in the column will be lost.
  - The required column `Id` was added to the `PortfolioImage` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `ImagePath` to the `PortfolioImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `PortfolioId` to the `PortfolioImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PortfolioImage" DROP CONSTRAINT "PortfolioImage_portfolio_id_fkey";

-- AlterTable
ALTER TABLE "PortfolioImage" DROP CONSTRAINT "PortfolioImage_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
DROP COLUMN "image_path",
DROP COLUMN "portfolio_id",
ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "Id" TEXT NOT NULL,
ADD COLUMN     "ImagePath" TEXT NOT NULL,
ADD COLUMN     "PortfolioId" TEXT NOT NULL,
ADD CONSTRAINT "PortfolioImage_pkey" PRIMARY KEY ("Id");

-- AddForeignKey
ALTER TABLE "PortfolioImage" ADD CONSTRAINT "PortfolioImage_PortfolioId_fkey" FOREIGN KEY ("PortfolioId") REFERENCES "portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
