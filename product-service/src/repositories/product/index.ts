import { ProductRepository } from './types';
import { MockProductRepository } from './MockProductRepository';

let productRepository: ProductRepository;

export function getProductRepository(): ProductRepository {
    if (!productRepository) {
        productRepository = new MockProductRepository();
    }

    return productRepository
}