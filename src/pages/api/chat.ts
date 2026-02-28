import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages: inputMessages } = await request.json();

    if (!inputMessages || !Array.isArray(inputMessages)) {
      return new Response(
        JSON.stringify({ error: '请提供消息内容' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 直接调用 Coze API
    const response = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer pat_zjXGbwh1n79zbSoaktFd9KH3qPr2NKOCfdoIfWyONMQdh52abZ8gjQxiiPXBbovA'
      },
      body: JSON.stringify({
        bot_id: '7487077223628017701',
        user_id: 'user_' + Date.now(),
        additional_messages: inputMessages,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Coze API error:', errorData);
      return new Response(
        JSON.stringify({ error: errorData.msg || 'API调用失败' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 直接返回Coze API的流式响应
    return new Response(response.body, {
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
