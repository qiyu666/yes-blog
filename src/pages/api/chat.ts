import type { APIRoute } from "astro";

interface ChatMessage {
	role: string;
	content: string;
}

interface RequestBody {
	messages: ChatMessage[];
}

// 讯飞Spark API配置
const SPARK_API_KEY = "bafe465421af01b17552f7f826f08eb4";
const _SPARK_API_SECRET = "YmM1MDUwNWQ4M2NmNTdmNjhmZmFkM2Mz";
const SPARK_API_URL = "https://spark-api-open.xf-yun.com/v1/chat/completions";

// 生成认证头
function generateAuthHeader() {
	// 使用 API Key 和 Secret 生成认证信息
	const timestamp = Math.floor(Date.now() / 1000).toString();
	const auth = Buffer.from(`${SPARK_API_KEY}:${timestamp}`).toString("base64");
	return `Bearer ${auth}`;
}

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = (await request.json()) as RequestBody;
		const { messages } = body;

		if (!messages || !Array.isArray(messages)) {
			return new Response(JSON.stringify({ error: "缺少消息参数" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		// 调用讯飞Spark API
		const sparkResponse = await fetch(SPARK_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: generateAuthHeader(),
				"X-API-Key": SPARK_API_KEY,
			},
			body: JSON.stringify({
				model: "general",
				messages: messages,
				stream: true,
				temperature: 0.8,
				max_tokens: 2000,
			}),
		});

		if (!sparkResponse.ok) {
			const errorText = await sparkResponse.text();
			console.error("Spark API错误:", sparkResponse.status, errorText);
			return new Response(
				JSON.stringify({ error: `Spark API错误: ${sparkResponse.statusText}` }),
				{
					status: sparkResponse.status,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// 处理流式响应
		const { readable, writable } = new TransformStream();
		const writer = writable.getWriter();

		// 异步处理流
		(async () => {
			try {
				const reader = sparkResponse.body?.getReader();
				if (!reader) {
					await writer.write(new TextEncoder().encode("data: [DONE]\n\n"));
					await writer.close();
					return;
				}

				const decoder = new TextDecoder();
				let buffer = "";

				while (true) {
					const { done, value } = await reader.read();
					if (done) {
						await writer.write(new TextEncoder().encode("data: [DONE]\n\n"));
						break;
					}

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");

					// 保留最后一个不完整的行
					buffer = lines.pop() || "";

					for (const line of lines) {
						if (line.startsWith("data: ")) {
							const data = line.slice(6);
							if (data === "[DONE]") {
								await writer.write(
									new TextEncoder().encode("data: [DONE]\n\n"),
								);
								continue;
							}

							try {
								const parsed = JSON.parse(data);
								// 提取讯飞API返回的内容
								const content = parsed.choices?.[0]?.delta?.content || "";
								if (content) {
									const response = { content };
									await writer.write(
										new TextEncoder().encode(
											`data: ${JSON.stringify(response)}\n\n`,
										),
									);
								}
							} catch (e) {
								console.error("解析JSON错误:", e);
							}
						}
					}
				}
			} catch (error) {
				console.error("处理流响应错误:", error);
				try {
					await writer.write(
						new TextEncoder().encode(
							`data: ${JSON.stringify({ error: "处理流数据出错" })}\n\n`,
						),
					);
				} catch {
					// 忽略写入错误
				}
			} finally {
				try {
					await writer.close();
				} catch {
					// 忽略关闭错误
				}
			}
		})();

		return new Response(readable, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("Chat API错误:", error);
		return new Response(
			JSON.stringify({
				error: `服务器错误: ${error instanceof Error ? error.message : "未知错误"}`,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
};
