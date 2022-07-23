import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { EntityNotFoundError } from "@repositories/errors/EntityNotFoundError";

import { ProductRepository } from "@repositories/product/types";

import schema from "./schema";

import { Logger } from "@libs/logger/types";

export function createHandler(
	getProductRepository: () => ProductRepository,
	getLogger: () => Logger
) {
	const getProductById: ValidatedEventAPIGatewayProxyEvent<
		typeof schema
	> = async (event) => {
		try {
			getLogger().log(event);

			return formatJSONResponse(
				await getProductRepository().getById(
					event.pathParameters.id
				)
			);
		} catch (error) {
			if (error instanceof EntityNotFoundError) {
				return formatJSONResponse({ message: error.message }, 404);
			}

			return formatJSONResponse({ message: "Unknown error" }, 500);
		}
	};

	return getProductById;
}
