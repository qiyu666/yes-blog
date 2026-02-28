import type { APIRoute } from 'astro';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages: inputMessages } = await request.json();

    if (!inputMessages || !Array.isArray(inputMessages)) {
      return new Response(
        JSON.stringify({ error: '请提供消息内容' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const config = new Config();
    const client = new LLMClient(config);

    // 添加系统提示
    const systemPrompt = {
      role: 'system' as const,
      content: `你是一个友好的AI博客助手，帮助用户解答关于博客、写作、技术等方面的问题。
你的回答应该：
1. 简洁明了，易于理解
2. 提供有价值的建议
3. 保持友好的语气
4. 如果用户问的是技术问题，可以提供代码示例`,
    };

    const messages = [systemPrompt, ...inputMessages];

    // 使用流式输出
    const stream = client.stream(messages, {
      model: 'doubao-seed-1-6-flash-250615',
      temperature: 0.7,
    });

    // 创建 ReadableStream 用于 SSE
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const content = chunk.content.toString();
              // SSE 格式: data: {content}\n\n
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          // 发送结束信号
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '生成回复时出错' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: '服务器错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
