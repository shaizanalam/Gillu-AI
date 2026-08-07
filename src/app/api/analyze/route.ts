import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    // Strip the data URL prefix if present to get raw base64
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    // Detect MIME type from data URL or default to jpeg
    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://gillu-ai.vercel.app",
        "X-Title": "Gillu AI Wardrobe Scanner",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-001",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a fashion and clothing expert AI. Analyze this clothing image and return a JSON response with the following fields:
{
  "item_name": "Name of the clothing item",
  "category": "Category (e.g., tops, bottoms, outerwear, footwear, accessories)",
  "color": "Primary color(s)",
  "brand": "Brand if visible, otherwise null",
  "material": "Estimated material/fabric",
  "season": "Best season (spring, summer, fall, winter, or all-season)",
  "occasion": "Best occasion (casual, formal, business, sport, party, or other)",
  "description": "Brief description of the item",
  "styling_tips": "2-3 styling suggestions for this item"
}
Return ONLY valid JSON, no markdown formatting or code blocks.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "AI analysis failed", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse the JSON response from the AI
    try {
      const analysis = JSON.parse(content);
      return NextResponse.json({ analysis });
    } catch {
      // If the AI response isn't valid JSON, return it as raw text
      return NextResponse.json({ analysis: { raw_response: content } });
    }
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
