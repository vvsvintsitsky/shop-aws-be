import { S3 } from "aws-sdk";

import { formatJSONResponse } from "@libs/api-gateway";

import { S3Event } from "aws-lambda";

export function createHandler({
	getS3Instance,
	uploadFolderName,
	parsedForlderName,
}: {
	getS3Instance: () => S3;
	uploadFolderName: string;
	parsedForlderName: string;
}) {
	const createUrlForImport = async (event: S3Event) => {
		try {
			console.log("START");

			const s3Instance = getS3Instance();

			const fileRecords = event.Records.filter(
				(record) => !!record.s3.object.size
			);

			console.log(`
				START\n
				${JSON.stringify(event.Records)}
				\n
				${JSON.stringify(fileRecords)}
			`);

			for (const record of fileRecords) {
				const {
					s3: {
						bucket: { name: bucketName },
						object: { key: objectKey },
					},
				} = record;

				console.log(`
					RECORD\n
					${JSON.stringify({
						Bucket: bucketName,
						CopySource: objectKey,
						Key: objectKey.replace(uploadFolderName, parsedForlderName),
					})}
					\n
					${JSON.stringify({ Bucket: bucketName, Key: objectKey })}
					\n
				`);

				await s3Instance
					.copyObject(
						{
							Bucket: bucketName,
							CopySource: objectKey,
							Key: objectKey.replace(uploadFolderName, parsedForlderName),
						},
						() => {}
					)
					.promise();
				await s3Instance
					.deleteObject({ Bucket: bucketName, Key: objectKey })
					.promise();
			}

			console.log(`
				END\n
			`);

			return formatJSONResponse(
				{
					message: "Files were successfully moved",
				},
				202,
				""
			);
		} catch (error) {
			console.log(`
				ERROR\n
				${error.message}
				\n
				${JSON.stringify(error)}
				\n
				ERROR END
				\n
			`);
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
