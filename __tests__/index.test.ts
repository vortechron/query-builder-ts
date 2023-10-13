import { query, QueryBuilder } from "../index";

test("query can build a path", () => {
	const path = query("/users").build();
	expect(path).toBe("/users");
});

test("query can build a path with a filter", () => {
	const path = query("/users").filter("name", "john").build();
	expect(path).toBe("/users?filter[name]=john");
});

test("query can build a path with multiple filters", () => {
	const path = query("/users")
		.filter("name", "john")
		.filter("age", "30")
		.build();
	expect(path).toBe("/users?filter[name]=john&filter[age]=30");
});

test("query can build a path with a sort", () => {
	const path = query("/users").sort("name").build();
	expect(path).toBe("/users?sort=name");
});

test("query can build a path with multiple sorts", () => {
	const path = query("/users").sort("name", "age").build();
	expect(path).toBe("/users?sort=name,age");
});

test("query can build a path with multiple sorts call", () => {
	const path = query("/users")
		.sort("name")
		.sort("age")
		.sort("id", "-sds")
		.build();
	expect(path).toBe("/users?sort=name,age,id,-sds");
});

test("query can build a path with an include", () => {
	const path = query("/users").include("posts").build();
	expect(path).toBe("/users?include=posts");
});

test("query can build a path with multiple includes", () => {
	const path = query("/users").include("posts", "comments").build();
	expect(path).toBe("/users?include=posts,comments");
});

test("query can build a path with an append", () => {
	const path = query("/users").append("posts").build();
	expect(path).toBe("/users?append=posts");
});

test("query can build a path with multiple appends", () => {
	const path = query("/users").append("posts", "comments").build();
	expect(path).toBe("/users?append=posts,comments");
});

test("query can build a path with a custom param", () => {
	const path = query("/users").param("custom", "value").build();
	expect(path).toBe("/users?custom=value");
});

test("query can build a path with multiple custom params", () => {
	const path = query("/users").param("custom", "value", "value2").build();
	expect(path).toBe("/users?custom=value,value2");
});

test("query can build a path with a custom param with multiple values", () => {
	const path = query("/users")
		.param("custom", "value")
		.param("custom2", "value2")
		.build();
	expect(path).toBe("/users?custom=value&custom2=value2");
});

test("query can build a path with a fields", () => {
	const path = query("/users")
		.fields({ users: ["name", "age"] })
		.build();
	expect(path).toBe("/users?fields[users]=name,age");
});

test("query can build a path with multiple fields", () => {
	const path = query("/users")
		.fields({ users: ["name", "age"], posts: ["title"] })
		.build();
	expect(path).toBe("/users?fields[users]=name,age&fields[posts]=title");
});

test("query can build a path with a page", () => {
	const path = query("/users").page(2).build();
	expect(path).toBe("/users?page=2");
});

test("query can build a path using when", () => {
	const path = query("/users")
		.when(true, (query) => {
			query.filter("name", "john");
		})
		.build();
	expect(path).toBe("/users?filter[name]=john");
});

test("query can build a path using when false", () => {
	const path = query("/users")
		.when(false, (query) => {
			query.filter("name", "john");
		})
		.build();
	expect(path).toBe("/users");
});

test("query can forget", () => {
	const path = query("/users")
		.filter("name", "john")
		.forget("filter[name]")
		.build();
	expect(path).toBe("/users");
});

test("query can forget multiple", () => {
	const path = query("/users")
		.filter("name", "john")
		.append("posts")
		.sort("name")
		.forgets("filter[name]", "append", "sort")
		.build();

	expect(path).toBe("/users");
});

test("query can forget value", () => {
	const path = query("/users")
		.sort("name", "age")
		.forgetValue("sort", "name")
		.build();

	expect(path).toBe("/users?sort=age");
});

test("query can set alias", () => {
	QueryBuilder.defineAliases({
		filter: "f",
	});

	const path = query("/users").filter("name", "john").build();

	expect(path).toBe("/users?f[name]=john");
});
