export interface ProductParams {
  id?: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  sku?: string;
  barcode?: string;
  quantity: number;
  trackQuantity: boolean;
  continueSellingWhenOutOfStock?: boolean;
  categories?: string[];
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  isPublished?: boolean;
  requiresShipping?: boolean;
  weight?: number;
  weightUnit?: 'g' | 'kg' | 'oz' | 'lb';
  images?: ProductImageParams[];
  options?: ProductOptionParams[];
  variants?: ProductVariantParams[];
  seoTitle?: string;
  seoDescription?: string;
  metadata?: Record<string, any>;
}

export interface CreateProductParams extends Omit<ProductParams, 'id' | 'variants' | 'options'> {
  salonId: string;
  createdBy: string;
  variants?: Omit<ProductVariantParams, 'id'>[];
  options?: Omit<ProductOptionParams, 'id'>[];
}

export interface UpdateProductParams extends Partial<Omit<ProductParams, 'id' | 'variants' | 'options'>> {
  id: string;
  updatedBy: string;
  variants?: (Omit<ProductVariantParams, 'id'> & { id?: string })[];
  options?: (Omit<ProductOptionParams, 'id'> & { id?: string })[];
}

export interface ProductQueryParams {
  salonId?: string;
  categoryId?: string;
  tagId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductImageParams {
  id?: string;
  url: string;
  altText?: string;
  isDefault?: boolean;
  position?: number;
  metadata?: Record<string, any>;
}

export interface ProductOptionParams {
  id?: string;
  name: string;
  values: string[];
  position?: number;
}

export interface ProductVariantParams {
  id?: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  quantity: number;
  weight?: number;
  option1?: string;
  option2?: string;
  option3?: string;
  position?: number;
  metadata?: Record<string, any>;
}

export interface ProductCategoryParams {
  id?: string;
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface ProductTagParams {
  id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface InventoryAdjustmentParams {
  productId: string;
  variantId?: string;
  quantity: number;
  note?: string;
  reason?: 'purchase' | 'return' | 'damaged' | 'lost' | 'found' | 'adjustment' | 'other';
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, any>;
}
