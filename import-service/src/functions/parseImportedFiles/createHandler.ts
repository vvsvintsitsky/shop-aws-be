import { S3, SQS } from "aws-sdk";
import csvParser from "csv-parser";

import { formatJSONResponse } from "@libs/api-gateway";

import { S3Event } from "aws-lambda";
import { Readable } from "stream";

function processRecordsFromStream(
	stream: Readable,
	processRecord: (record: Record<string, unknown>) => Promise<void>
) {
	const recordProcessingPromises: Promise<void>[] = [];
	stream.on("data", (data) => {
		recordProcessingPromises.push(processRecord(data));
	});

	return new Promise<void>((resolve, reject) => {
		stream
			.on("end", async () => {
				await Promise.allSettled(recordProcessingPromises);
				resolve();
			})
			.on("error", reject);
	});
}

export function createHandler({
	getS3Instance,
	getSQSInstance,
	queueUrl,
}: {
	getS3Instance: () => S3;
	getSQSInstance: () => SQS;
	queueUrl: string;
}) {
	const createUrlForImport = async (event: S3Event) => {
		try {
			const s3Instance = getS3Instance();
			const sqsIntance = getSQSInstance();

			console.log(`START Product parsing ${JSON.stringify(event)}`);

			const fileRecords = event.Records.filter(
				(record) => !!record.s3.object.size
			);

			const fileRecordProcessing = fileRecords.map(
				({
					s3: {
						bucket: { name: bucketName },
						object: { key: objectKey },
					},
				}) => {
					const productParsingStream = s3Instance
						.getObject({ Bucket: bucketName, Key: objectKey })
						.createReadStream()
						.pipe(csvParser());

					return processRecordsFromStream(
						productParsingStream,
						async (product) => {
							await sqsIntance
								.sendMessage({
									QueueUrl: queueUrl,
									MessageBody: JSON.stringify(product),
								})
								.promise();
						}
					);
				}
			);

			await Promise.allSettled(fileRecordProcessing);
			return formatJSONResponse({
				message: "Products parsed",
			});
		} catch (error) {
			console.log(`
				ERROR ${error.message}\n
				${JSON.stringify(error)}
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
