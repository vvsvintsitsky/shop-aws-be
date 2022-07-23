export interface DataSourceConfig {
	database: string;
	password: string | (() => string);
	login: string;
	port: number;
	host: string;
}

export interface QueryResultRow {
	[column: string]: string | number | null;
}

export interface QueryResult<T extends QueryResultRow> {
	rows: T[];
	rowCount: number;
	oid: number;
}

export interface QueryConfig<I extends ReadonlyArray<any>> {
    name?: string | undefined;
    text: string;
    values?: I | undefined;
}

export interface DataSource {
	query<T extends QueryResultRow, I extends ReadonlyArray<any>>(
		query: string | QueryConfig<I>,
		values?: Array<string | number | null>
	): Promise<QueryResult<T>>;
	interactWithinConnection<T>(callback: () => T): Promise<T>;
	interactWithinTransaction<T>(callback: () => T): Promise<T>;
}
