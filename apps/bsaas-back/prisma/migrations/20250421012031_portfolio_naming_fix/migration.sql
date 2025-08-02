/*
  Warnings:

  - You are about to drop the `PortfolioImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PortfolioImage" DROP CONSTRAINT "PortfolioImage_PortfolioId_fkey";

-- DropTable
DROP TABLE "PortfolioImage";

-- CreateTable
CREATE TABLE "portfolio_image" (
    "id" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "image_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "portfolio_image" ADD CONSTRAINT "portfolio_image_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
