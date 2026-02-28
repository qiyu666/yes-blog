import type { APIRoute } from 'astro';

// DuckDuckGo AI Chat API
const DUCKDUCKGO_CHAT_URL = 'https://duckduckgo.com/duckchat/v1/chat';
const DUCKDUCKGO_STATUS_URL = 'https://duckduckgo.com/duckchat/v1/status';

// 获取 DuckDuckGo 的 x-vqd-4 token
async function getVQDToken(): Promise<string | null> {
  try {
    const response = await fetch(DUCKDUCKGO_STATUS_URL, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-store',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0'
      }
    });
    
    const vqd = response.headers.get('x-vqd-4');
    return vqd;
  } catch (error) {
    console.error('Failed to get VQD token:', error);
    return null;
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages: inputMessages } = await request.json();

    if (!inputMessages || !Array.isArray(inputMessages)) {
      return new Response(
        JSON.stringify({ error: '请提供消息内容' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取 VQD token
    const vqd = await getVQDToken();
    if (!vqd) {
      return new Response(
        JSON.stringify({ error: '无法连接到 AI 服务' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 转换消息格式
    const formattedMessages = inputMessages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // 调用 DuckDuckGo AI
    const response = await fetch(DUCKDUCKGO_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-store',
        'x-vqd-4': vqd,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku', // 可选: gpt-4o-mini, claude-3-haiku, llama-3.1-70b, mixtral-8x7b
        messages: formattedMessages
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('DuckDuckGo API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI 服务暂时不可用，请稍后再试' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 创建转换流，将 DuckDuckGo 的格式转换为 OpenAI 格式
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              continue;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.message) {
                // 转换为 OpenAI 格式
                const openaiFormat = {
                  content: parsed.message
                };
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(openaiFormat)}\n\n`));
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    });

    // 返回流式响应
    return new Response(response.body?.pipeThrough(transformStream), {
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
