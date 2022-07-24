import S3 from "aws-sdk/clients/s3";

import { middyfy } from "@libs/lambda";

import config from "../../../config.json";

import { createHandler } from "./createHandler";

export const main = middyfy(
	createHandler({
		getS3Instance: () => new S3({ region: config.REGION }),
		uploadFolderName: config.UPLOAD_FOLDER_NAME,
		parsedForlderName: config.PARSED_FOLDER_NAME,
	})
);
