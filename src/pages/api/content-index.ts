import { generateContentIndex, searchContentIndex } from "@utils/contentIndex";

export async function GET({ url }) {
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
}
