import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const { slug, name, email, content } = body;

		if (!slug || !name || !content) {
			return new Response(JSON.stringify({ error: "缺少必要参数" }), {
				status: 400,
			});
		}

		// 使用 Cloudflare D1 数据库
		const db = locals.runtime.env.DB;
		const id = Date.now().toString();
		const created_at = new Date().toISOString();

		await db
			.prepare(
				"INSERT INTO comments (id, slug, name, email, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
			)
			.bind(id, slug, name, email || null, content, created_at)
			.run();

		const comment = {
			id,
			slug,
			name,
			email,
			content,
			created_at,
		};

		return new Response(JSON.stringify({ success: true, comment }), {
			status: 200,
		});
	} catch (error) {
		console.error("Error creating comment:", error);
		return new Response(JSON.stringify({ error: "服务器错误" }), {
			status: 500,
		});
	}
};

export const GET: APIRoute = async ({ request, locals }) => {
	try {
		const url = new URL(request.url);
		const slug = url.searchParams.get("slug");

		if (!slug) {
			return new Response(JSON.stringify({ error: "缺少 slug 参数" }), {
				status: 400,
			});
		}

		// 使用 Cloudflare D1 数据库
		const db = locals.runtime.env.DB;
		const { results } = await db
			.prepare("SELECT * FROM comments WHERE slug = ? ORDER BY created_at DESC")
			.bind(slug)
			.all();

		const comments = results || [];

		return new Response(JSON.stringify({ success: true, comments }), {
			status: 200,
		});
	} catch (error) {
		console.error("Error fetching comments:", error);
		return new Response(JSON.stringify({ error: "服务器错误" }), {
			status: 500,
		});
	}
};
