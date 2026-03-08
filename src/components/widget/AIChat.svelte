<script>
  import { onMount, onDestroy } from 'svelte';
  import { $state } from 'svelte';

  let messages = $state([]);
  let inputMessage = $state('');
  let isLoading = $state(false);
  let chatWindowOpen = $state(false);

  // 星火API配置
  const API_KEY = 'bafe465421af01b17552f7f826f08eb4';
  const API_URL = 'https://spark-api-open.xf-yun.com/v1/chat/completions';

  // 发送消息到星火API
  async function sendMessage() {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    messages.push({ role: 'user', content: userMessage });
    inputMessage = '';
    isLoading = true;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'spark-ultra32k',
          messages: messages,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;
      messages.push({ role: 'assistant', content: assistantMessage });
    } catch (error) {
      messages.push({ 
        role: 'assistant', 
        content: '抱歉，我暂时无法回答您的问题，请稍后再试。' 
      });
      console.error('Error:', error);
    } finally {
      isLoading = false;
    }
  }

  // 处理回车键发送消息
  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  // 切换聊天窗口
  function toggleChatWindow() {
    chatWindowOpen = !chatWindowOpen;
  }
</script>

<div class="ai-chat-container">
  <!-- 聊天窗口切换按钮 -->
  <button 
    class="chat-toggle-button" 
    on:click={toggleChatWindow}
    aria-label={chatWindowOpen ? '关闭AI聊天' : '打开AI聊天'}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  </button>

  <!-- 聊天窗口 -->
  {#if chatWindowOpen}
    <div class="chat-window">
      <div class="chat-header">
        <h3>AI 助手</h3>
        <button 
          class="close-button" 
          on:click={toggleChatWindow}
          aria-label="关闭"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="chat-messages">
        {#each messages as message}
          <div class={`message ${message.role}`}>
            <div class="message-content">
              {message.content}
            </div>
          </div>
        {/each}
        {#if isLoading}
          <div class="message assistant">
            <div class="message-content loading">
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
            </div>
          </div>
        {/if}
      </div>

      <div class="chat-input-container">
        <input
          type="text"
          bind:value={inputMessage}
          on:keypress={handleKeyPress}
          placeholder="输入您的问题..."
          class="chat-input"
          disabled={isLoading}
        />
        <button 
          on:click={sendMessage} 
          class="send-button"
          disabled={isLoading}
          aria-label="发送"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .ai-chat-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
  }

  .chat-toggle-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #3b82f6;
    color: white;
    border: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .chat-toggle-button:hover {
    background-color: #2563eb;
    transform: scale(1.05);
  }

  .chat-window {
    width: 350px;
    height: 450px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
  }

  .chat-header {
    padding: 16px;
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chat-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 4px;
  }

  .close-button:hover {
    background-color: #f3f4f6;
    color: #374151;
  }

  .chat-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background-color: #ffffff;
  }

  .message {
    margin-bottom: 12px;
    max-width: 80%;
  }

  .message.user {
    align-self: flex-end;
    margin-left: auto;
  }

  .message.assistant {
    align-self: flex-start;
  }

  .message-content {
    padding: 10px 14px;
    border-radius: 18px;
    line-height: 1.4;
  }

  .message.user .message-content {
    background-color: #3b82f6;
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message.assistant .message-content {
    background-color: #f3f4f6;
    color: #111827;
    border-bottom-left-radius: 4px;
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .loading-dot {
    width: 8px;
    height: 8px;
    background-color: #6b7280;
    border-radius: 50%;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .loading-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .loading-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .chat-input-container {
    padding: 12px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 8px;
    background-color: #f9fafb;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }

  .chat-input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 20px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .chat-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .chat-input:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }

  .send-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #3b82f6;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .send-button:hover:not(:disabled) {
    background-color: #2563eb;
    transform: scale(1.05);
  }

  .send-button:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }

  /* 响应式设计 */
  @media (max-width: 480px) {
    .chat-window {
      width: 300px;
      height: 400px;
    }
  }
</style>