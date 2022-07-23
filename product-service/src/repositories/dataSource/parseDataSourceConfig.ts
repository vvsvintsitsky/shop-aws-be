import { ENV_CONFIG } from "@libs/config/types";
import { DataSourceConfig } from "./types";

export function parseDataSourceConfig(envConfig: ENV_CONFIG): DataSourceConfig {
    return {
        host: envConfig.DB_HOST,
        database: envConfig.DB_NAME,
        login: envConfig.DB_LOGIN,
        password: envConfig.DB_PASSWORD,
        port: Number(envConfig.DB_PORT),
    }
}