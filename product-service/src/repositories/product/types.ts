import { Product } from "src/types/Product"

export interface ProductRepository {
    getById(productId: string): Promise<Product>
    getAll(): Promise<Product[]>
}