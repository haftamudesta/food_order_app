const axios = require("axios");

exports.analyzeReviewsWithAI = async (reviews) => {
  if (!process.env.GROQ_API_KEY) {
    console.warn("GROQ_API_KEY not configured. Returning default analysis.");
    return {
      sentiment: "mixed",
      summaryBullets: [
        "Good food quality",
        "Friendly service",
        "Clean environment",
      ],
      topMentions: ["food", "service", "taste"],
    };
  }

  if (!reviews || reviews.length === 0) {
    return {
      sentiment: "neutral",
      summaryBullets: ["Be the first to review this restaurant!"],
      topMentions: [],
    };
  }

  try {
    const reviewTexts = reviews
      .map((r) => r.comment)
      .filter((t) => t && t.trim());

    if (reviewTexts.length === 0) {
      return {
        sentiment: "neutral",
        summaryBullets: [
          "No text reviews available",
          "Check back later for insights",
        ],
        topMentions: [],
      };
    }

    const prompt = `
Analyze these restaurant reviews and return ONLY valid JSON in this exact format:

{
  "sentiment": "positive" | "negative" | "mixed",
  "summaryBullets": ["point1", "point2", "point3"],
  "topMentions": ["word1", "word2", "word3"]
}

Rules:
- sentiment must be exactly one of: "positive", "negative", or "mixed"
- summaryBullets should be 3-5 key points summarizing customer feedback
- topMentions should be the most frequently mentioned words/topics (max 5)

Reviews:
${reviewTexts.map((text, i) => `${i + 1}. ${text}`).join("\n")}
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const content = response.data.choices[0].message.content;
    let cleanContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");

    const result = JSON.parse(cleanContent);

    return {
      sentiment: result.sentiment || "mixed",
      summaryBullets: Array.isArray(result.summaryBullets)
        ? result.summaryBullets.slice(0, 5)
        : ["No summary available"],
      topMentions: Array.isArray(result.topMentions)
        ? result.topMentions.slice(0, 5)
        : [],
    };
  } catch (error) {
    console.error(
      "AI Review Analysis Error:",
      error.response?.data || error.message,
    );

    const avgRating =
      reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
    let sentiment = "mixed";
    if (avgRating >= 4) sentiment = "positive";
    else if (avgRating <= 2) sentiment = "negative";

    return {
      sentiment: sentiment,
      summaryBullets: [
        `Average rating: ${avgRating.toFixed(1)}/5 from ${reviews.length} reviews`,
      ],
      topMentions: [],
    };
  }
};
