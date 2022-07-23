import { ENV_CONFIG } from "./types";

export function readConfigFromEnv(): ENV_CONFIG {
    return {
        DB_HOST: process.env.DB_HOST,
        DB_NAME: process.env.DB_NAME,
        DB_LOGIN: process.env.DB_LOGIN,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_PORT: process.env.DB_PORT,
    }
}
