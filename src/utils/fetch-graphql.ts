import fetch from "node-fetch";

const STRAPI_API_URL = "https://postedin-site-dev-app-db-sfo3.postedin.net/graphql";
const STRAPI_TOKEN =
	"66a73e569dcb36ceef250e3c8f4044e7d52c41897f4a4b07e3d7db441105545788dc7ba944d08d1ea9e0121d9c9afaa9db76cb9563b3c695149e53027627a7b2d565abc1e0bd7f53cdacc90cd9787d3ae35efef10c039a0adc025c7a38a8d01aed898ab93969a26bc25fac7bb27d6b1902733e02b5e42e09772fc87eba533e31";

export const fetchGraphql = async (query: any) => {
	const response = await fetch(STRAPI_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${STRAPI_TOKEN}`,
		},
		body: JSON.stringify({ query }),
	});

	return await response.json();
};
