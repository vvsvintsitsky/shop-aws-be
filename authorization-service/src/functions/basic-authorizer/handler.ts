import { APIGatewayAuthorizerEvent } from "aws-lambda";

function generatePolicy(principalId: string, effect: string, resource: string) {
	return {
		principalId,
		policyDocument: {
			Version: "2012-10-17",
			Statement: [
				{
					Action: "execute-api:Invoke",
					Effect: effect,
					Resource: resource,
				},
			],
		},
	};
}

async function basicAuthorizer(event: APIGatewayAuthorizerEvent) {
	console.log(event);

	if (event.type !== "TOKEN") {
		throw new Error('Expected "event.type" parameter to have value "TOKEN"');
	}

	const { authorizationToken = "", methodArn } = event;

	const authorizationTokenValue = authorizationToken.split("Bearer ")[1];

	if (!authorizationTokenValue) {
		throw "Unauthorized";
	}

	const [username, password] = Buffer.from(authorizationTokenValue, "base64")
		.toString("utf-8")
		.split(":");

	if (username !== process.env.USERNAME || password !== process.env.PASSWORD) {
		return generatePolicy(authorizationTokenValue, "Deny", methodArn);
	}

	return generatePolicy(authorizationTokenValue, "Allow", methodArn);
}

export const main = basicAuthorizer;
