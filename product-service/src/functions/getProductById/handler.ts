import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { EntityNotFoundError } from '@repositories/errors/EntityNotFoundError';

import { getProductRepository }from '@repositories/product'

import schema from './schema';

const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    return formatJSONResponse(await getProductRepository().getById(event.pathParameters.id));
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return formatJSONResponse({ message: error.message }, 404);
    }

    throw error
  }
};

export const main = middyfy(getProductById);
