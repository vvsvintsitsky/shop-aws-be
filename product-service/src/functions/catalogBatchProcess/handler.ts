import { SNS } from "aws-sdk";

import { getLogger } from "@libs/logger";

import { getProductRepository } from "@repositories/product";

import { createHandler } from "./createHandler";

export const main = createHandler({
	getProductRepository,
	getLogger,
	topicArn: process.env.SNS_ARN,
	getSns: () => new SNS({ region: process.env.REGION }),
});
