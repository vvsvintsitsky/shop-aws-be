import { readConfigFromEnv } from "@libs/config/readConfigFromEnv";
import { parseDataSourceConfig } from "./parseDataSourceConfig";
import { PostgresDataSource } from "./PostgresDataSource";

const config = parseDataSourceConfig(readConfigFromEnv());

export function getDataSource() {
    return new PostgresDataSource(config);
}