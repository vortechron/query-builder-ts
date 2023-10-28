import { query } from "..";

class QueryBuilder {
	_path: string;
	_params: Record<string, string[]> = {};
	static aliases: Record<string, string> = {};

	constructor(_path: string) {
		this._path = _path;
	}

	static defineAliases(aliases: Record<string, string>) {
		QueryBuilder.aliases = aliases;
	}

	filter(key: string, value: string) {
		this.createOrUpdateParams(`filter[${key}]`, [value]);

		return this;
	}

	sort(...sorts: string[]) {
		this.createOrUpdateParams("sort", sorts);

		return this;
	}

	include(...includes: string[]) {
		this.createOrUpdateParams("include", includes);

		return this;
	}

	append(...appends: string[]) {
		this.createOrUpdateParams("append", appends);

		return this;
	}

	param(key: string, ...values: string[]) {
		this.createOrUpdateParams(key, values);

		return this;
	}

	fields(data: Record<string, string[]>) {
		Object.entries(data).forEach(([key, values]) => {
			this.createOrUpdateParams(`fields[${key}]`, values);
		});

		return this;
	}

	page(page: number) {
		this._params["page"] = [page.toString()];
		return this;
	}

	when(condition: boolean, callback: (query: QueryBuilder) => void) {
		if (condition) {
			callback(this);
		}

		return this;
	}

	forgetValue(key: string, value: string) {
		if (!this._params[key]) {
			key = this.parseKeyToAlias(key);
		}

		this._params[key] = (this._params[key] || []).filter(
			(val) => val !== value
		);

		return this;
	}

	forget(key: string) {
		if (!this._params[key]) {
			key = this.parseKeyToAlias(key);
		}

		delete this._params[key];

		return this;
	}

	forgets(...keys: string[]) {
		keys.forEach((key) => {
			this.forget(key);
		});

		return this;
	}

	createOrUpdateParams(key: string, values: string[]) {
		key = this.parseKeyToAlias(key);
		this._params[key] = [...(this._params[key] || []), ...values];

		return this;
	}

	parseKeyToAlias(key: string) {
		Object.entries(QueryBuilder.aliases).forEach(([alias, keyAlias]) => {
			if (key.includes(alias)) {
				key = key.replace(alias, keyAlias);
			}
		});

		return key;
	}

	tap(callback: (query: QueryBuilder) => void) {
		callback(this);

		return this;
	}

	scopes(...scopes: ((query: QueryBuilder) => QueryBuilder)[]) {
		scopes.forEach((scope) => scope(this));

		return this;
	}

	buildParams(key: string) {
		const param = this._params[key];
		if (param) {
			return `${key}=${param.join(",")}`;
		}

		return "";
	}

	buildAsArray(options?: {
		includePath?: boolean;
		includePagination?: boolean;
		excludes?: string[];
	}) {
		let data: string[] = [];

		if (options?.includePath) {
			data.push(this._path);
		}

		Object.keys(this._params).map((key) => {
			if (options?.excludes?.includes(key)) {
				return;
			}

			if (
				!options?.includePagination &&
				(key === "page" || key === "limit")
			) {
				return;
			}

			data.push(this.buildParams(key));
		});

		return data;
	}

	build() {
		const params = Object.keys(this._params).map((key) =>
			this.buildParams(key)
		);

		let qMark = this.shouldHaveQmark() ? "?" : "";

		return `${this._path}${qMark}${this.connectQueryString(...params)}`;
	}

	shouldHaveQmark() {
		return Object.keys(this._params).length > 0;
	}

	connectQueryString(...strings: string[]) {
		return strings.filter((string) => string.length > 0).join("&");
	}
}

export default QueryBuilder;
