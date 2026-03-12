// ========================================
// LLM API Service - Multi Provider Support
// ========================================

export type LLMProvider = 'siliconflow' | 'minimax' | 'openai';

export interface ProviderConfig {
  id: LLMProvider;
  name: string;
  apiBase: string;
  defaultModel: string;
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'siliconflow',
    name: '硅基流动',
    apiBase: 'https://api.siliconflow.com/v1',
    defaultModel: 'Qwen/Qwen2.5-7B-Instruct',
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    apiBase: 'https://api.minimax.chat/v1',
    defaultModel: 'abab6.5s-chat',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    apiBase: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
  },
];

export function getProviderConfig(provider: LLMProvider): ProviderConfig {
  return PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const OPTIMIZE_SYSTEM_PROMPT = `你是一个提示词优化专家。请将用户的原始提示词优化为更清晰、更具体、更有结构的形式。

优化原则：
1. 明确角色和身份 - 让AI知道该做什么角色
2. 拆解具体需求 - 越详细越好，包含背景信息
3. 添加约束条件 - 如输出格式、长度限制等
4. 使用结构化格式 - 用编号、标题、分隔符组织内容
5. 保持原意 - 不要改变用户的需求意图

输出格式要求：
- 直接输出优化后的提示词，不要添加解释
- 不要添加"以下是优化后的提示词"等前缀
- 优化后的提示词应该是一个完整的、可直接使用的指令`;

export async function optimizePrompt(
  userPrompt: string,
  apiKey: string,
  provider: LLMProvider = 'siliconflow',
  model?: string
): Promise<string> {
  if (!apiKey.trim()) {
    throw new Error('请先配置 API Key');
  }

  if (!userPrompt.trim()) {
    throw new Error('请输入要优化的提示词');
  }

  const config = getProviderConfig(provider);
  const selectedModel = model || config.defaultModel;

  const requestBody: ChatRequest = {
    model: selectedModel,
    messages: [
      {
        role: 'system',
        content: OPTIMIZE_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `请优化以下提示词：\n\n${userPrompt}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  };

  const response = await fetch(`${config.apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'API 请求失败';
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || errorData.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    if (response.status === 401) {
      throw new Error('API Key 无效，请检查设置中的 API Key');
    }
    if (response.status === 429) {
      throw new Error('请求过于频繁，请稍后再试');
    }
    
    throw new Error(`API 错误: ${errorMessage}`);
  }

  const data: ChatResponse = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('未获取到有效的优化结果');
  }

  return data.choices[0].message.content;
}

export function validateApiKey(apiKey: string): boolean {
  return apiKey.trim().length > 0;
}

export async function testApiKey(
  apiKey: string,
  provider: LLMProvider = 'siliconflow'
): Promise<{ success: boolean; message: string }> {
  if (!apiKey.trim()) {
    return { success: false, message: '请输入 API Key' };
  }

  const config = getProviderConfig(provider);

  const requestBody: ChatRequest = {
    model: config.defaultModel,
    messages: [
      {
        role: 'user',
        content: 'Hi',
      },
    ],
    temperature: 0.7,
    max_tokens: 10,
  };

  try {
    const response = await fetch(`${config.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      return { success: true, message: 'API Key 验证成功！' };
    }

    const errorText = await response.text();
    let errorMessage = '验证失败';
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || errorData.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    if (response.status === 401) {
      return { success: false, message: 'API Key 无效' };
    }

    return { success: false, message: errorMessage };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : '网络请求失败' };
  }
}
