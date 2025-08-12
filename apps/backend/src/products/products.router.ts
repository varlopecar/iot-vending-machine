import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { ProductsService } from './products.service';
import { z } from 'zod';
import {
  createProductSchema,
  updateProductSchema,
  productSchema,
} from './products.schema';
import type { CreateProductInput, UpdateProductInput } from './products.schema';

@Router({ alias: 'products' })
export class ProductsRouter {
  constructor(private readonly productsService: ProductsService) {}

  @Query({
    output: z.array(productSchema),
  })
  getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Query({
    input: z.object({ id: z.string().min(1) }),
    output: productSchema,
  })
  getProductById(@Input('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Query({
    input: z.object({ category: z.string() }),
    output: z.array(productSchema),
  })
  getProductsByCategory(@Input('category') category: string) {
    return this.productsService.getProductsByCategory(category);
  }

  @Mutation({
    input: createProductSchema,
    output: productSchema,
  })
  createProduct(@Input() productData: CreateProductInput) {
    return this.productsService.createProduct(productData);
  }

  @Mutation({
    input: z.object({
      id: z.uuid(),
      data: updateProductSchema,
    }),
    output: productSchema,
  })
  updateProduct(
    @Input('id') id: string,
    @Input('data') data: UpdateProductInput,
  ) {
    return this.productsService.updateProduct(id, data);
  }

  @Mutation({
    input: z.object({ id: z.uuid() }),
    output: z.boolean(),
  })
  deleteProduct(@Input('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
