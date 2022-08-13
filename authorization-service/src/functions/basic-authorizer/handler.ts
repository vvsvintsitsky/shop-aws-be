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

function basicAuthorizer(event: APIGatewayAuthorizerEvent) {
	console.log(event);

  if (event.type !== 'TOKEN') {
    throw new Error('Expected "event.type" parameter to have value "TOKEN"');
  }

	const { authorizationToken, methodArn } = event;

	if (!authorizationToken) {
		throw "Unauthorized";
	}

	if (authorizationToken !== "aaa") {
		return generatePolicy("user", "Deny", methodArn);
	}

	return generatePolicy("user", "Allow", methodArn);
}

export const main = basicAuthorizer;
