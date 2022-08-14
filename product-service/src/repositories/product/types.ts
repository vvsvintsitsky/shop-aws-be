import { Product } from "src/types/Product";

export interface ProductRepository {
	getById(productId: string): Promise<Product>;
	getAll(): Promise<Product[]>;
	create(product: Product): Promise<Product>;
	createBatch(products: Product[]): Promise<void>;
}
