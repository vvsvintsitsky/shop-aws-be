import type { AWS } from "@serverless/typescript";

import getProductById from "@functions/getProductById";
import getProductsList from "@functions/getProductsList";
import createProduct from "@functions/createProduct";
import swagger from "@functions/swagger";

import envConfig from "./envConfig.json";
import vpcConfig from "./vpcConfig.json";

const serverlessConfiguration: AWS = {
	service: "product-service",
	frameworkVersion: "3",
	plugins: ["serverless-esbuild"],
	provider: {
		name: "aws",
		runtime: "nodejs14.x",
		region: "us-east-1",
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
		},
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
			NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
			...envConfig,
		},
		vpc: {
			subnetIds: vpcConfig.SUBNET_IDS,
			securityGroupIds: vpcConfig.SECURITY_GROUP_IDS,
		},
	},
	functions: { getProductById, getProductsList, createProduct, swagger },
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
		},
	},
};

module.exports = serverlessConfiguration;
