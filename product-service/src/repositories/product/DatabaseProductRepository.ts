import { DataSource } from "@repositories/dataSource/types";
import { EntityNotFoundError } from "@repositories/errors/EntityNotFoundError";
import { Product } from "src/types/Product";
import { ProductRepository } from "./types";

export class DatabaseProductRepository implements ProductRepository {
	constructor(private createDataSource: () => DataSource) {}

	private static SELECT_PRODUCT_QUERY =
		"SELECT id, title, description, price, count from products p LEFT JOIN stocks s ON p.id = s.product_id";

	async getById(productId: string): Promise<Product> {
        const dataSource = this.createDataSource();

		const { rowCount, rows } = await dataSource.interactWithinConnection(
			() =>
				dataSource.query<Product, [string]>({
					name: "get-product-by-id",
					text: `${DatabaseProductRepository.SELECT_PRODUCT_QUERY} WHERE p.id = $1`,
					values: [productId],
				})
		);

		if (!rowCount) {
			throw new EntityNotFoundError(
				`Product with id=${productId} was not found`
			);
		}

		return rows[0];
	}

	async getAll(): Promise<Product[]> {
        const dataSource = this.createDataSource();

		const { rows } = await dataSource.interactWithinConnection(() =>
			dataSource.query<Product, [string]>({
				name: "get-products",
				text: DatabaseProductRepository.SELECT_PRODUCT_QUERY,
			})
		);

		return rows;
	}

	async create(product: Product): Promise<Product> {
        const dataSource = this.createDataSource();

		return dataSource.interactWithinTransaction(async () => {
			await dataSource.query<{}, [string, string, string, number]>({
				name: "create-product",
				text: "INSERT INTO products (id, title, description, price) VALUES ($1, $2, $3, $4)",
				values: [product.id, product.title, product.description, product.price],
			});

			await dataSource.query<{}, [string, number]>({
				name: "create-stock",
				text: "INSERT INTO stocks (product_id, count) VALUES ($1, $2)",
				values: [product.id, product.count],
			});

			return product;
		});
	}
}
