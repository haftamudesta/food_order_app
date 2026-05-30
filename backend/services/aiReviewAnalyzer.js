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
      summaryBullets: ["No reviews available yet"],
      topMentions: [],
    };
  }

  try {
    const reviewTexts = reviews
      .map((r) => r.comment || r.text || "")
      .filter((t) => t.trim());

    if (reviewTexts.length === 0) {
      return {
        sentiment: "neutral",
        summaryBullets: ["No review text available"],
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
${reviewTexts.join("\n---\n")}
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
    // Clean the response (remove any markdown code blocks)
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

    return {
      sentiment: "mixed",
      summaryBullets: ["Unable to analyze reviews at this time"],
      topMentions: [],
    };
  }
};

exports.analyzeSingleReview = async (reviewText) => {
  if (!reviewText || !reviewText.trim()) {
    return {
      sentiment: "neutral",
      rating: 3,
      keyPhrases: [],
    };
  }

  try {
    const prompt = `
Analyze this restaurant review and return ONLY valid JSON:

{
  "sentiment": "positive" | "negative" | "neutral",
  "rating": 1-5,
  "keyPhrases": ["phrase1", "phrase2"]
}

Review: "${reviewText}"
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
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
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Single review analysis error:", error.message);
    return {
      sentiment: "neutral",
      rating: 3,
      keyPhrases: [],
    };
  }
};
