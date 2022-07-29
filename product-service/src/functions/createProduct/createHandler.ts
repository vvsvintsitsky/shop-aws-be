import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { Logger } from "@libs/logger/types";

import { ProductRepository } from "@repositories/product/types";

import schema from "./schema";

export function createHandler(
	getProductRepository: () => ProductRepository,
	getLogger: () => Logger
) {
	const createProduct: ValidatedEventAPIGatewayProxyEvent<
		typeof schema
	> = async (event) => {
		try {
			getLogger().log(event);

			return formatJSONResponse(
				await getProductRepository().create(event.body),
				201
			);
		} catch (error) {
			return formatJSONResponse({ message: "Unknown error" }, 500);
		}
	};

	return createProduct;
}
