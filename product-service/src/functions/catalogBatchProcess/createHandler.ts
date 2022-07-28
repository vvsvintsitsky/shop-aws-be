import { SQSEvent } from "aws-lambda";
import { SNS } from "aws-sdk";

import { Logger } from "@libs/logger/types";

import { ProductRepository } from "@repositories/product/types";

export function createHandler({
	getProductRepository,
	getSns,
	getLogger,
	topicArn,
}: {
	getProductRepository: () => ProductRepository;
	getSns: () => SNS;
	topicArn: string;
	getLogger: () => Logger;
}) {
	const createProduct = async (event: SQSEvent) => {
		try {
			const logger = getLogger();
			logger.log(event.Records as unknown as Record<string, unknown>);

			const productsToCreate = event.Records.map(({ body }) =>
				JSON.parse(body)
			);

			await getProductRepository().createBatch(productsToCreate);

			await getSns()
				.publish({
					TopicArn: topicArn,
					Subject: "Batch created",
					Message: JSON.stringify(productsToCreate),
				})
				.promise();

			return {
				statusCode: 201,
				body: "Products created",
			};
		} catch (error) {
			getLogger().log({
				message: `ERROR: ${error.message}, ${JSON.stringify(error)}`,
			});
			return {
				statusCode: 500,
				body: error.message,
			};
		}
	};

	return createProduct;
}
