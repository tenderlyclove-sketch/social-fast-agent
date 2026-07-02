import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
      const { niche } = await req.json();

          const response = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                      {
                              method: "POST",
                                      headers: {
                                                "Content-Type": "application/json",
                                                          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                                                                  },
                                                                          body: JSON.stringify({
                                                                                    model: "meta-llama/llama-3.3-70b-instruct",
                                                                                              messages: [
                                                                                                          {
                                                                                                                        role: "system",
                                                                                                                                      content:
                                                                                                                                                      "You are an expert viral content strategist. Your job is to create unique, engaging, practical and highly clickable content ideas. Never explain your answer. Never add introductions or conclusions. Return only the requested ideas. Make every idea different, creative and ready to publish.",
                                                                                                                                                                  },
                                                                                                                                                                              {
                                                                                                                                                                                            role: "user",
                                                                                                                                                                                                          content: `Generate exactly 10 unique viral content ideas for the niche: ${niche}.

                                                                                                                                                                                                          Rules:
                                                                                                                                                                                                          - Return ONLY the ideas.
                                                                                                                                                                                                          - Number them from 1 to 10.
                                                                                                                                                                                                          - One idea per line.
                                                                                                                                                                                                          - Do not write "Here are 10 ideas".
                                                                                                                                                                                                          - Do not write explanations.
                                                                                                                                                                                                          - Do not write introductions.
                                                                                                                                                                                                          - Do not write conclusions.
                                                                                                                                                                                                          - Do not output extra symbols like )) or markdown.
                                                                                                                                                                                                          - Make every idea original, catchy and highly shareable.`,
                                                                                                                                                                                                                      },
                                                                                                                                                                                                                                ],
                                                                                                                                                                                                                                        }),
                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                  );

                                                                                                                                                                                                                                                      const data = await response.json();

                                                                                                                                                                                                                                                          console.log("OpenRouter response:", data);

                                                                                                                                                                                                                                                              if (!response.ok) {
                                                                                                                                                                                                                                                                    return NextResponse.json(
                                                                                                                                                                                                                                                                            { error: data.error?.message || "OpenRouter request failed" },
                                                                                                                                                                                                                                                                                    { status: 500 }
                                                                                                                                                                                                                                                                                          );
                                                                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                                                                  const text = data.choices?.[0]?.message?.content || "";

                                                                                                                                                                                                                                                                                                      const ideas = text
                                                                                                                                                                                                                                                                                                            .split("\n")
                                                                                                                                                                                                                                                                                                                  .map((line: string) => line.trim())
                                                                                                                                                                                                                                                                                                                        .filter((line: string) => line.length > 0);

                                                                                                                                                                                                                                                                                                                            return NextResponse.json({ ideas });
                                                                                                                                                                                                                                                                                                                              } catch (error) {
                                                                                                                                                                                                                                                                                                                                  console.error(error);

                                                                                                                                                                                                                                                                                                                                      return NextResponse.json(
                                                                                                                                                                                                                                                                                                                                            { error: "Internal Server Error" },
                                                                                                                                                                                                                                                                                                                                                  { status: 500 }
                                                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                        }