import { Client } from "pg";
import {
	DataSource,
	DataSourceConfig,
	QueryResult,
	QueryResultRow,
} from "./types";

export class PostgresDataSource implements DataSource {
	private client: Client;

	constructor(config: DataSourceConfig) {
		this.client = new Client({
			database: config.database,
			user: config.login,
			password: config.password,
			port: config.port,
			host: config.host,
		});
	}

	query<T extends QueryResultRow>(
		queryString: string,
		values?: (string | number)[]
	): Promise<QueryResult<T>> {
		return this.client.query(queryString, values);
	}

	async interactWithinConnection<T>(callback: () => T) {
		await this.client.connect();

		const result = await callback();

		await this.client.end();

		return result
	}

	async interactWithinTransaction<T>(callback: () => T) {
		return this.interactWithinConnection(async () => {
			try {
				await this.client.query('BEGIN');
				const res = await callback()
				await this.client.query('COMMIT')
				return res
			} catch (error) {
				await this.client.query('ROLLBACK')
				throw error
			}
		})
	}
}
