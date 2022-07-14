import { EntityNotFoundError } from "@repositories/errors/EntityNotFoundError";
import { Product } from "src/types/Product";

import { ProductRepository } from "./types";

const mockProducts: Product[] = Array.from({ length: 20 }, (_, index) => ({
    id: String(index),
    price: index + 1,
    description: `Product_description_${index}`,
    title: `Product_title_${index}`,
}));

export class MockProductRepository implements ProductRepository {
    async getById(productId: string): Promise<Product> {
        const product = mockProducts.find(({ id })=> id === productId);

        if (!product) {
            throw new EntityNotFoundError(`Product with id=${productId} was not found`);
        }

        return product;
    }
    
    async getAll(): Promise<Product[]> {
        return mockProducts;
    }
}