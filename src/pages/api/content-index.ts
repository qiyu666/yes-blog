import { generateContentIndex, searchContentIndex } from "@utils/contentIndex";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }) => {
	const query = url.searchParams.get("q");
	const index = await generateContentIndex();

	if (query) {
		const results = searchContentIndex(index, query);
		return new Response(JSON.stringify(results), {
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(JSON.stringify(index), {
		headers: { "Content-Type": "application/json" },
	});
};
