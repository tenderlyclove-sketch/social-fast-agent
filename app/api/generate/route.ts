import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
      const { niche } = await req.json();

          const response = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                      {
                              method: "POST",
                                      headers: {
                                                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                                                          "Content-Type": "application/json",
                                                                  },
                                                                          body: JSON.stringify({
                                                                                    model: "meta-llama/llama-3.3-70b-instruct",
                                                                                              messages: [
                                                                                                          {
                                                                                                                        role: "system",
                                                                                                                                      content: "You are a viral social media content expert.",
                                                                                                                                                  },
                                                                                                                                                              {
                                                                                                                                                                            role: "user",
                                                                                                                                                                                          content: `Generate 10 viral content ideas for the niche: ${niche}. Return each idea on a new line.`,
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
                                                                                                                                                                                                                                                                                                  .map((line: string) => line.replace(/^\d+[\).\-\s]*/, "").trim())
                                                                                                                                                                                                                                                                                                        .filter(Boolean);

                                                                                                                                                                                                                                                                                                            return NextResponse.json({ ideas });
                                                                                                                                                                                                                                                                                                              } catch (error) {
                                                                                                                                                                                                                                                                                                                  console.error(error);
                                                                                                                                                                                                                                                                                                                      return NextResponse.json(
                                                                                                                                                                                                                                                                                                                            { error: "Server error" },
                                                                                                                                                                                                                                                                                                                                  { status: 500 }
                                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                        }