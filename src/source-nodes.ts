import type { GatsbyNode } from "gatsby";
import { fetchGraphql } from "./utils/fetch-graphql";
import {
	type GraphQlIntrospectionQuery,
	GraphQlType,
	GraphQlTypeInner,
	introspectionQuery,
} from "./utils/graphql-queries";

type GraphQlTypesMap = { [key: string]: GraphQlType };

export const sourceNodes: GatsbyNode["sourceNodes"] = async function (gatsbyApi): Promise<void> {
	const {
		actions: { createNode },
		createNodeId,
		createContentDigest,
		reporter,
	} = gatsbyApi;

	const { data }: GraphQlIntrospectionQuery = await fetchGraphql(introspectionQuery);

	const types: GraphQlTypesMap = Object.fromEntries(
		data.__schema.types.map((data: any) => [data.name, data])
	);

	const queries = [];
	for (const field of types.Query.fields) {
		if (field.name === "uploadFiles" || field.name === "uploadFolders") {
			continue;
		}

		if (
			field.type.kind === "OBJECT" &&
			field.type.name &&
			(field.type.name.endsWith("EntityResponseCollection") ||
				field.type.name.endsWith("EntityResponse"))
		) {
			queries.push(buildQueryFromType(field.name, types[field.type.name], types));
		}
	}

	const timer = reporter.activityTimer("Queries");
	timer.start();
	const { data: strapiNodes } = await fetchGraphql("query {" + queries.join("\n\n") + "}");
	timer.end();

	console.dir(strapiNodes, { depth: 2 });

	// @ts-ignore
	for (let [name, { data }] of Object.entries(strapiNodes)) {
		if (!data) {
			continue;
		}

		if (!Array.isArray(data)) {
			data = [data];
		}

		for (const { id, attributes } of data) {
			createNode({
				...attributes,
				id: createNodeId(`${name}-${id}`),
				strapiId: id,
				internal: {
					type: name,
					contentDigest: createContentDigest({ id, attributes }),
				},
			});
		}
	}

	/*for (const type of data.__schema.types) {
		if (
			type.kind === "OBJECT" &&
			(type.name?.endsWith("ResponseCollection") || type.name?.endsWith("Response"))
		) {
			// console.dir({ query: buildQueryFromType(type) }, { depth: null });
		}

		if (type.kind === "OBJECT") {
			if (
				type.name &&
				(type.name === "Error" ||
					type.name === "Pagination" ||
					type.name === "ResponseCollectionMeta" ||
					type.name === "Query" ||
					type.name === "Mutation" ||
					type.name.startsWith("__"))
			) {
				continue;
			}
		}
	}*/
};

function buildQueryFromType(name: string, type: GraphQlType, types: GraphQlTypesMap): string {
	return name + " {\n\t\t" + buildQueryFields(type, types, 2) + "\n\t}";
	return "query {\n\t" + name + " {\n\t\t" + buildQueryFields(type, types, 2) + "\n\t}\n}";
}

function buildQueryFields(type: GraphQlType, types: GraphQlTypesMap, depth = 1): string {
	return type.fields
		.map((field) => {
			let object = field.type as GraphQlTypeInner;
			while (object.kind !== "OBJECT" && object.ofType) {
				object = object.ofType;

				if (object.kind === "UNION") {
					return null;
				}
			}

			if (object.kind === "OBJECT") {
				if (depth > 15 || !object.name || field.name === "localizations") {
					return null;
				}

				const nested = buildQueryFields(types[object.name], types, depth + 1);

				if (!nested) {
					return null;
				}

				return (
					field.name + " {\n" + "\t".repeat(depth + 1) + nested + "\n" + "\t".repeat(depth) + "}"
				);
			}
			// console.dir(field, { depth: null });

			return field.name;
		})
		.filter(Boolean)
		.join("\n" + "\t".repeat(depth));
}
