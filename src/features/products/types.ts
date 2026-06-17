// ==============================
// Database Row Types
// ==============================

export type ProductRow = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
};

export type ProductVariantRow = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  discount_price: number;
  stock: number;
};

export type ProductOptionRow = {
  id: string;
  product_id: string;
  name: string;
};

export type ProductOptionValueRow = {
  id: string;
  option_id: string;
  value: string;
  extra_price: number;
};

// ==============================
// Full Product (with relations)
// ==============================

export type ProductOptionValueFull = ProductOptionValueRow;

export type ProductOptionFull = ProductOptionRow & {
  product_option_values: ProductOptionValueFull[];
};

export type ProductFull = ProductRow & {
  product_variants: ProductVariantRow[];
  product_options: ProductOptionFull[];
};

// ==============================
// Form / Payload Types
// ==============================

export type ProductFormVariant = {
  id: string; // client-side UUID for key
  name: string;
  price: string;
  discount_price: string;
  stock: string;
};

export type ProductFormOptionValue = {
  id: string;
  value: string;
  extra_price: string;
};

export type ProductFormOption = {
  id: string;
  name: string;
  values: ProductFormOptionValue[];
};

export type ProductFormData = {
  name: string;
  description: string;
  image_url: string;
};
