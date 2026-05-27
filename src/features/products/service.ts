import { supabase } from "../../lib/supabase/client";
import type {
  ProductFull,
  ProductFormData,
  ProductFormVariant,
  ProductFormOption,
} from "./types";

// ==============================
// FETCH ALL PRODUCTS
// ==============================

export async function fetchProducts(searchQuery = ""): Promise<ProductFull[]> {
  let query = supabase
    .from("products")
    .select(
      `
      *,
      product_variants (*),
      product_options (
        *,
        product_option_values (*)
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (searchQuery.trim()) {
    query = query.ilike("name", `%${searchQuery.trim()}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as ProductFull[]) ?? [];
}

// ==============================
// FETCH SINGLE PRODUCT
// ==============================

export async function fetchProductById(
  id: string,
): Promise<ProductFull | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_variants (*),
      product_options (
        *,
        product_option_values (*)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ProductFull;
}

// ==============================
// CREATE PRODUCT
// ==============================

export async function createProduct(
  product: ProductFormData,
  variants: ProductFormVariant[],
  options: ProductFormOption[],
): Promise<void> {
  // 1. Insert product
  const { data: productData, error: productError } = await supabase
    .from("products")
    .insert({
      name: product.name,
      description: product.description,
      image_url: product.image_url,
    })
    .select("id")
    .single();

  if (productError) throw productError;

  const productId = productData.id;

  // 2. Insert variants
  if (variants.length > 0) {
    const variantRows = variants.map((v) => ({
      product_id: productId,
      name: v.name,
      price: parseFloat(v.price) || 0,
      discount_price: parseFloat(v.discount_price) || 0,
      stock: v.stock,
    }));

    const { error: variantError } = await supabase
      .from("product_variants")
      .insert(variantRows);

    if (variantError) throw variantError;
  }

  // 3. Insert options + option values
  for (const option of options) {
    const { data: optionData, error: optionError } = await supabase
      .from("product_options")
      .insert({
        product_id: productId,
        name: option.name,
      })
      .select("id")
      .single();

    if (optionError) throw optionError;

    if (option.values.length > 0) {
      const valueRows = option.values.map((val) => ({
        option_id: optionData.id,
        value: val.value,
        extra_price: parseFloat(val.extra_price) || 0,
      }));

      const { error: valueError } = await supabase
        .from("product_option_values")
        .insert(valueRows);

      if (valueError) throw valueError;
    }
  }
}

// ==============================
// UPDATE PRODUCT
// ==============================

export async function updateProduct(
  productId: string,
  product: ProductFormData,
  variants: ProductFormVariant[],
  options: ProductFormOption[],
): Promise<void> {
  // 1. Update product
  const { error: productError } = await supabase
    .from("products")
    .update({
      name: product.name,
      description: product.description,
      image_url: product.image_url,
    })
    .eq("id", productId);

  if (productError) throw productError;

  // 2. Delete old variants, then re-insert
  const { error: deleteVariantError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId);

  if (deleteVariantError) throw deleteVariantError;

  if (variants.length > 0) {
    const variantRows = variants.map((v) => ({
      product_id: productId,
      name: v.name,
      price: parseFloat(v.price) || 0,
      discount_price: parseFloat(v.discount_price) || 0,
      stock: v.stock,
    }));

    const { error: variantError } = await supabase
      .from("product_variants")
      .insert(variantRows);

    if (variantError) throw variantError;
  }

  // 3. Delete old options (cascade will handle option_values), then re-insert
  const { error: deleteOptionError } = await supabase
    .from("product_options")
    .delete()
    .eq("product_id", productId);

  if (deleteOptionError) throw deleteOptionError;

  for (const option of options) {
    const { data: optionData, error: optionError } = await supabase
      .from("product_options")
      .insert({
        product_id: productId,
        name: option.name,
      })
      .select("id")
      .single();

    if (optionError) throw optionError;

    if (option.values.length > 0) {
      const valueRows = option.values.map((val) => ({
        option_id: optionData.id,
        value: val.value,
        extra_price: parseFloat(val.extra_price) || 0,
      }));

      const { error: valueError } = await supabase
        .from("product_option_values")
        .insert(valueRows);

      if (valueError) throw valueError;
    }
  }
}

// ==============================
// DELETE PRODUCT
// ==============================

export async function deleteProduct(productId: string): Promise<void> {
  // Delete options first (cascade should handle option_values)
  const { error: optionError } = await supabase
    .from("product_options")
    .delete()
    .eq("product_id", productId);

  if (optionError) throw optionError;

  // Delete variants
  const { error: variantError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId);

  if (variantError) throw variantError;

  // Delete product
  const { error: productError } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (productError) throw productError;
}
