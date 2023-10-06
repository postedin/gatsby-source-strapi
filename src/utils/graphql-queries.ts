export type GraphQlTypeInner = {
	kind?: string;
	name?: string;
	ofType?: GraphQlTypeInner;
};

export type GraphQlArg = {
	name: string;
	description?: string;
	type: GraphQlTypeInner;
};

export type GraphQlField = {
	name: string;
	description?: string;
	args?: GraphQlArg[];
	type: GraphQlType;
};

export type GraphQlType = GraphQlTypeInner & {
	possibleTypes?: GraphQlTypeInner[];
	interfaces?: GraphQlTypeInner[];
	enumValues?: {
		name: string;
	}[];
	fields: GraphQlField[];
};

export type GraphQlIntrospection = {
	__schema: {
		types: GraphQlType[];
	};
};

export type GraphQlIntrospectionQuery = {
	data: GraphQlIntrospection;
};

export const introspectionQuery = /* GraphQL */ `
	{
		__schema {
			types {
				kind
				name

				possibleTypes {
					kind
					name
				}
				interfaces {
					kind
					name
				}
				enumValues {
					name
				}
				ofType {
					kind
					name
					ofType {
						kind
						name
						ofType {
							kind
							name
						}
					}
				}
				fields {
					name
					description
					args {
						name
						type {
							kind
							name
							inputFields {
								name
							}
						}
					}
					type {
						name
						kind
						ofType {
							kind
							name
							ofType {
								kind
								name
								ofType {
									kind
									name
								}
							}
						}
					}
				}
			}

			mutationType {
				fields {
					type {
						name
					}
				}
			}
		}
	}
`;
