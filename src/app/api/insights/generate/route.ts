import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { correlations } = await req.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are a high-performance coach analyzing 90 days of biometric and behavior data.
Write direct, actionable insights. Each insight should feel like a coach speaking to the athlete — confident, specific, not hedging.
Format: 3-5 insights as JSON array with fields: insight_text, recommended_action, category (recovery/training/business/habits).`,
      messages: [
        {
          role: 'user',
          content: `Here are the correlations found in the last 90 days of data:\n\n${JSON.stringify(correlations, null, 2)}\n\nGenerate 4 coaching insights from these patterns. Return only valid JSON.`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    return NextResponse.json({ insights })
  } catch (err) {
    console.error('Insights generation error:', err)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
