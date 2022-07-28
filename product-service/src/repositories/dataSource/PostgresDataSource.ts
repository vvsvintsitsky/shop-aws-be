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
		let result: T;

		try {
			await this.client.connect();
			result = await callback();
		} finally {
			await this.client.end();
		}

		return result;
	}

	async interactWithinTransaction<T>(callback: () => T) {
		return this.interactWithinConnection(async () => {
			let result: T;

			try {
				await this.client.query("BEGIN");
				result = await callback();
				await this.client.query("COMMIT");
			} catch (error) {
				await this.client.query("ROLLBACK");
				throw error;
			}

			return result;
		});
	}

	public prepareBatchValues<T extends Record<string, V>, V>(
		values: T[],
		mapValueToArray: (value: T) => V[]
	) {
		const mappedValues = values.map(mapValueToArray);

		return {
			queryValues: mappedValues.flat(),
			valuesTemplate: mappedValues
				.map(({ length }, itemIndex) => {
					const startIndex = itemIndex * length;
					return `(${Array.from(
						{ length },
						(_, index) => `$${startIndex + index + 1}`
					).join(",")})`;
				})
				.join(","),
		};
	}
}
