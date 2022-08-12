import { S3 } from "aws-sdk";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";

import schema from "./schema";

export function createHandler({
	getS3Instance,
	uploadFolderName,
	bucketName,
	expiresIn,
}: {
	getS3Instance: () => S3;
	uploadFolderName: string;
	bucketName: string;
	expiresIn: number;
}) {
	const createUrlForImport: ValidatedEventAPIGatewayProxyEvent<
		typeof schema
	> = async (event) => {
		try {
			const fileName = event.queryStringParameters.name;

			const s3Instance = getS3Instance();

			const urlForUpload = await s3Instance.getSignedUrlPromise("putObject", {
				Bucket: bucketName,
				Key: `${uploadFolderName}/${fileName}`,
				Expires: expiresIn,
				ContentType: "text/csv",
			});

			return formatJSONResponse({
				urlForUpload,
			});
		} catch (error) {
			return formatJSONResponse(
				{
					message: "Unknown error",
				},
				500
			);
		}
	};

	return createUrlForImport;
}
