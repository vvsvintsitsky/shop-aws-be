import { middyfy } from "@libs/lambda";
import { getLogger } from "@libs/logger";

import { getProductRepository } from "@repositories/product";

import { createHandler } from "./createHandler";

export const main = middyfy(createHandler(getProductRepository, getLogger));
