import { S3 } from "aws-sdk";

import { mock, instance, when, objectContaining, anything } from "ts-mockito";
import { APIGatewayProxyResult, Context } from "aws-lambda";

import { ValidatedAPIGatewayProxyEvent } from "@libs/api-gateway";

import { createHandler } from "./createHandler";

describe("getProductsList", () => {
	const bucketName = "bname";
	const uploadFolderName = "ufname";
	const expiresIn = 10;
	const fileName = "fname";

	const invoke = async (s3Instance: S3): Promise<APIGatewayProxyResult> => {
		const eventMock = mock<ValidatedAPIGatewayProxyEvent<{ type: "object" }>>();
		when(eventMock.queryStringParameters).thenReturn({ name: fileName });

		const handler = createHandler({
			getS3Instance: () => s3Instance,
			bucketName,
			uploadFolderName,
			expiresIn,
		});

		return handler(
			instance(eventMock),
			instance(mock<Context>()),
			() => {}
		) as unknown as APIGatewayProxyResult;
	};

	describe("when url generation is successful", () => {
		const successUrl = "surl";

		const invokeSuccessulHandler = () => {
			const s3Mock = mock<S3>();
			when(
				s3Mock.getSignedUrlPromise("putObject", objectContaining({
					Bucket: bucketName,
					Key: `${uploadFolderName}/${fileName}`,
					Expires: expiresIn,
					ContentType: "text/csv",
				}))
			).thenResolve(successUrl);

			return invoke(instance(s3Mock));
		};

		it("should return 200 status code", async () => {
			expect((await invokeSuccessulHandler()).statusCode).toEqual(200);
		});

		it("should return url for file upload in body", async () => {
			expect(JSON.parse((await invokeSuccessulHandler()).body)).toEqual({
				urlForUpload: successUrl,
			});
		});
	});

    describe("when url generation is failed", () => {
		const invokeFailedHandler = () => {
			const s3Mock = mock<S3>();
			when(
				s3Mock.getSignedUrlPromise(anything(), anything())
			).thenReject(new Error('error'));

			return invoke(instance(s3Mock));
		};

		it("should return 500 status code", async () => {
			expect((await invokeFailedHandler()).statusCode).toEqual(500);
		});
	});
});
