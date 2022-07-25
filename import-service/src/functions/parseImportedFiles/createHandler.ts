import { S3 } from "aws-sdk";
import csvParser from "csv-parser";

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
			const s3Instance = getS3Instance();

			const fileRecords = event.Records.filter(
				(record) => !!record.s3.object.size
			);

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

				const objectReadStream = s3Instance
					.getObject({ Bucket: bucketName, Key: objectKey })
					.createReadStream();
				const csvParsingStream = objectReadStream.pipe(csvParser());

				await new Promise((resolve, reject) => {
					csvParsingStream
						.on("data", (data) => {
							console.log(
								JSON.stringify({
									Bucket: bucketName,
									Key: objectKey,
									ParsedRow: data,
								})
							);
						})
						.on("end", resolve)
						.on("error", reject);
				});
			}

			return formatJSONResponse(
				{
					message: "Files were successfully moved",
				},
				202,
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
