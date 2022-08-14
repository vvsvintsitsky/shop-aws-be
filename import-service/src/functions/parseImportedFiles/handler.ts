import { SQS, S3 } from "aws-sdk";

import config from "../../../config.json";

import { createHandler } from "./createHandler";

export const main = createHandler({
	getS3Instance: () => new S3({ region: config.REGION }),
	getSQSInstance: () => new SQS(),
	queueUrl: process.env.SQS_URL,
});
