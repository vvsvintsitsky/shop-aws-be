import { mock, instance, when } from "ts-mockito";
import { APIGatewayProxyResult, Context } from "aws-lambda";

import { ValidatedAPIGatewayProxyEvent } from "@libs/api-gateway";
import { EntityNotFoundError } from "@repositories/errors/EntityNotFoundError";
import { ProductRepository } from "@repositories/product/types";
import { Product } from "src/types/Product";

import { createHandler } from "./createHandler";
import { Logger } from "@libs/logger/types";

describe("getProductById", () => {
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

  describe("given product is present", () => {
    const [product] = products;

    const getProduct = async (): Promise<APIGatewayProxyResult> => {
      const productRepositoryMock = mock<ProductRepository>();
      when(productRepositoryMock.getById(product.id)).thenResolve(product);

      const handler = createHandler(() => instance(productRepositoryMock), () => instance(mock<Logger>()));

      const eventMock = createEventMock();
      when(eventMock.pathParameters).thenReturn({ id: product.id });

      return handler(
        instance(eventMock),
        instance(mock<Context>()),
        () => {}
      ) as unknown as APIGatewayProxyResult;
    };

    it("then should return 200 status code", async () => {
      expect((await getProduct()).statusCode).toEqual(200);
    });

    it("then should return product in body", async () => {
      expect(JSON.parse((await getProduct()).body)).toEqual(product);
    });
  });

  describe("given product is missing", () => {
    const [product] = products;

    const getProduct = async (): Promise<APIGatewayProxyResult> => {
      const productRepositoryMock = mock<ProductRepository>();
      when(productRepositoryMock.getById(product.id)).thenReject(new EntityNotFoundError());

      const handler = createHandler(() => instance(productRepositoryMock), () => instance(mock<Logger>()));

      const eventMock = createEventMock();
      when(eventMock.pathParameters).thenReturn({ id: product.id });

      return handler(
        instance(eventMock),
        instance(mock<Context>()),
        () => {}
      ) as unknown as APIGatewayProxyResult;
    };

    it("then should return 404 status code", async () => {
      expect((await getProduct()).statusCode).toEqual(404);
    });
  });
});
