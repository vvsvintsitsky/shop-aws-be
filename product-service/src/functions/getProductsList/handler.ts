import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { getProductRepository }from '@repositories/product'
import { ProductRepository } from '@repositories/product/types';

import schema from './schema';

export function createHandler(getProductRepository: () => ProductRepository) {
  const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
    return formatJSONResponse(await getProductRepository().getAll());
  };

  return getProductsList;
}


export const main = middyfy(createHandler(getProductRepository));
