import { mock, instance, when } from "ts-mockito";
import { APIGatewayProxyResult, Context } from "aws-lambda";

import { ValidatedAPIGatewayProxyEvent } from "@libs/api-gateway";
import { ProductRepository } from "@repositories/product/types";
import { Product } from "src/types/Product";

import { createHandler } from "./createHandler";
import { Logger } from "@libs/logger/types";

describe("getProductsList", () => {
  const products: Product[] = [
    {
      id: "id",
      description: "desc",
      title: "ttl",
      price: 1,
      count: 1,
    },
  ];

  const createEventMock = () =>
    mock<ValidatedAPIGatewayProxyEvent<{ type: "object" }>>();

  const getProducts = async (): Promise<APIGatewayProxyResult> => {
    const productRepositoryMock = mock<ProductRepository>();
    when(productRepositoryMock.getAll()).thenResolve(products);

    const handler = createHandler(() => instance(productRepositoryMock), () => instance(mock<Logger>()));

    return handler(
      instance(createEventMock()),
      instance(mock<Context>()),
      () => {}
    ) as unknown as APIGatewayProxyResult;
  };

  it("should return 200 status code", async () => {
    expect((await getProducts()).statusCode).toEqual(200);
  });

  it("should return products in body", async () => {
    expect(JSON.parse((await getProducts()).body)).toEqual(products);
  });
});
