import { ProductRepository } from './types';
import { DatabaseProductRepository } from './DatabaseProductRepository';
import { getDataSource } from '@repositories/dataSource';

let productRepository: ProductRepository;

export function getProductRepository(): ProductRepository {
    if (!productRepository) {
        productRepository = new DatabaseProductRepository(getDataSource);
    }

    return productRepository
}