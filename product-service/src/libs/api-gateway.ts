import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import type { FromSchema } from "json-schema-to-ts";

export type ValidatedAPIGatewayProxyEvent<S> = Omit<
  APIGatewayProxyEvent,
  "body"
> & { body: FromSchema<S> };
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

export function formatJSONResponse<T extends Record<string, unknown>>(
  response: T | unknown[],
  statusCode = 200,
  allowOrigin = "*"
) {
  return {
    statusCode,
    body: JSON.stringify(response),
    ...(allowOrigin
      ? {
          headers: {
            "Access-Control-Allow-Origin": allowOrigin,
            "Access-Control-Allow-Credentials": true,
          },
        }
      : {}),
  };
}
