import { Request, Response } from 'express';
import { env } from '../config/env';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';

interface ChatHistoryPart {
  text: string;
}

interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: ChatHistoryPart[];
}

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { prompt, history = [], systemInstruction = '' } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json(ApiResponse.error('Prompt is required and must be non-empty text.'));
  }

  // Cap prompt size to prevent token exhaustion / prompt injection flood
  const cleanPrompt = prompt.trim().slice(0, 1500);

  // If Gemini API key is not configured, reply with success false so client gracefully uses local knowledge engine
  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.includes('your_key')) {
    return res.status(200).json({
      success: false,
      text: '',
      message: 'Gemini API not configured on server; fallback to local rules.',
    });
  }

  // Sanitize and limit history to prevent excessive payload
  const safeHistory: ChatHistoryItem[] = Array.isArray(history)
    ? history.slice(-6).map((item: any) => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(item.parts?.[0]?.text || item.text || '').slice(0, 1000) }],
      }))
    : [];

  const contents = [
    ...safeHistory,
    {
      role: 'user',
      parts: [{ text: cleanPrompt }],
    },
  ];

  try {
    const payload: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    };

    if (systemInstruction && typeof systemInstruction === 'string') {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction.slice(0, 2000) }],
      };
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.warn(`Gemini API returned status ${response.status}: ${errText.slice(0, 200)}`);
      return res.status(200).json({
        success: false,
        text: '',
        message: 'Gemini request unsuccessful; fallback to local engine.',
      });
    }

    const data: any = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({
      success: true,
      text: replyText,
    });
  } catch (error) {
    logger.error('Failed to proxy chat message to Gemini:', { error: (error as Error).message });
    return res.status(200).json({
      success: false,
      text: '',
      message: 'Failed to contact Gemini upstream; fallback to local engine.',
    });
  }
});
