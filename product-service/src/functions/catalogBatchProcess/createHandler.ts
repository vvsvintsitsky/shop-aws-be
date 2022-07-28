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

			const message = JSON.stringify(productsToCreate);

			getSns().publish(
				{
					TopicArn: topicArn,
					Subject: "Batch created",
					Message: JSON.stringify(productsToCreate),
				},
				(error) => {
					if (!error) {
						logger.log({
							message: `message successfully sent for batch: ${message}`,
						});
						return;
					}

					logger.log({
						error: `ERROR sending email: ${error.message}, ${JSON.stringify(
							error
						)}`,
					});
				}
			);
		} catch (error) {
			getLogger().log({
				message: `ERROR: ${error.message}, ${JSON.stringify(error)}`,
			});
		}
	};

	return createProduct;
}
