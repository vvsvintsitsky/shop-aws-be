import type { AWS } from "@serverless/typescript";

import getProductById from "@functions/getProductById";
import getProductsList from "@functions/getProductsList";
import createProduct from "@functions/createProduct";
import swagger from "@functions/swagger";
import catalogBatchProcess from "@functions/catalogBatchProcess";

import envConfig from "./envConfig.json";
import vpcConfig from "./vpcConfig.json";
import sqsConfig from "./sqsConfig.json";
import snsConfig from "./snsConfig.json";

const region = "us-east-1";

const serverlessConfiguration: AWS = {
	service: "product-service",
	frameworkVersion: "3",
	plugins: ["serverless-esbuild"],
	provider: {
		name: "aws",
		runtime: "nodejs14.x",
		region,
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
		},
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
			NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
			SNS_ARN: { Ref: "CatalogBatchSimpleNotificationsTopic" },
			REGION: region,
			...envConfig,
		},
		vpc: {
			subnetIds: vpcConfig.SUBNET_IDS,
			securityGroupIds: vpcConfig.SECURITY_GROUP_IDS,
		},
		iamRoleStatements: [
			{
				Effect: "Allow",
				Action: "sns:*",
				Resource: { Ref: "CatalogBatchSimpleNotificationsTopic" },
			},
		],
	},
	functions: {
		getProductById,
		getProductsList,
		createProduct,
		swagger,
		catalogBatchProcess: {
			...catalogBatchProcess,
			events: [
				{
					sqs: {
						arn: { "Fn::GetAtt": ["CatalogBatchSimpleQueue", "Arn"] },
						batchSize: 5,
					},
				},
			],
		},
	},
	package: { individually: true },
	custom: {
		esbuild: {
			bundle: true,
			minify: false,
			sourcemap: true,
			exclude: ["aws-sdk", "pg-native"],
			target: "node14",
			define: { "require.resolve": undefined },
			platform: "node",
			concurrency: 10,
		},
	},
	resources: {
		Resources: {
			AWSLambdaVPCAccessExecutionRole: {
				Type: "AWS::IAM::ManagedPolicy",
				Properties: {
					Description: "Creating policy for vpc connetion.",
					Roles: [{ Ref: "IamRoleLambdaExecution" }],
					PolicyDocument: {
						Version: "2012-10-17",
						Statement: [
							{
								Effect: "Allow",
								Action: [
									"ec2:CreateNetworkInterface",
									"ec2:DescribeNetworkInterfaces",
									"ec2:DeleteNetworkInterface",
								],
								Resource: "*",
							},
						],
					},
				},
			},
			CatalogBatchSimpleQueue: {
				Type: "AWS::SQS::Queue",
				Properties: {
					QueueName: sqsConfig.QUEUE_NAME,
				},
			},
			CatalogBatchSimpleNotificationsTopic: {
				Type: "AWS::SNS::Topic",
				Properties: {
					TopicName: snsConfig.TOPIC_NAME,
				},
			},
			CatalogBatchSimpleNotificationsSuscription: {
				Type: "AWS::SNS::Subscription",
				Properties: {
					Protocol: "email",
					Endpoint: snsConfig.ENDPOINT,
					TopicArn: { Ref: "CatalogBatchSimpleNotificationsTopic" },
				},
			},
		},
		Outputs: {
			CatalogBatchSimpleQueueUrl: {
				Value: { Ref: "CatalogBatchSimpleQueue" },
				Export: {
					Name: "CatalogBatchSimpleQueueUrl",
				},
			},
			CatalogBatchSimpleQueueArn: {
				Value: { "Fn::GetAtt": ["CatalogBatchSimpleQueue", "Arn"] },
				Export: {
					Name: "CatalogBatchSimpleQueueArn",
				},
			},
		},
	},
};

module.exports = serverlessConfiguration;
