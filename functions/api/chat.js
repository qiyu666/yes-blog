export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { messages, model } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "缺少 messages 参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = context.env.PUBLIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "服务器未配置 API 密钥" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://gpt.qt.cool/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || "kimi-k2.6",
        messages,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `上游请求失败: ${response.status}`, detail: errorText }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(
      JSON.stringify({ error: "服务器错误", detail: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
