CREATE TABLE "products" (
	"id" uuid NOT NULL,
	"title" character varying(255) NOT NULL UNIQUE,
	"description" character varying(255) NOT NULL,
	"price" numeric NOT NULL CONSTRAINT positive_price CHECK (price > 0),
	CONSTRAINT "products_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "stocks" (
	"product_id" uuid NOT NULL,
	"count" integer NOT NULL CONSTRAINT positive_or_zero_count CHECK (count >= 0),
	CONSTRAINT "stocks_pk" PRIMARY KEY ("product_id")
) WITH (
  OIDS=FALSE
);

ALTER TABLE "stocks" ADD CONSTRAINT "products_stocks_fk0" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;


BEGIN;
INSERT INTO
	products (id, title, description, price)
VALUES
	('47a0ef54-2ef6-4378-81f8-9757f108ea21', 'product1', 'description1', 1),
	('95db01de-5b79-442e-b0bf-f33c48996482', 'product2', 'description2', 2),
	('a5bc34f2-49d3-410a-b4e8-56813d0d4743', 'product3', 'description3', 3),
	('73c85f31-419c-4bac-a552-1b606707261d', 'product4', 'description4', 4);

INSERT INTO
	stocks (product_id, count)
VALUES
	('47a0ef54-2ef6-4378-81f8-9757f108ea21', 10),
	('95db01de-5b79-442e-b0bf-f33c48996482', 9),
	('a5bc34f2-49d3-410a-b4e8-56813d0d4743', 8),
	('73c85f31-419c-4bac-a552-1b606707261d', 7);
COMMIT;