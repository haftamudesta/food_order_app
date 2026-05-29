const axios = require("axios");

exports.generateDishDescription = async ({
  name,
  category,
  spiceLevel,
  price,
}) => {
  const prompt = `You are a professional food description writer for a restaurant menu.

Generate a detailed, appetizing description for the following dish:

Dish Name: ${name}
Category: ${category || "Main Course"}
Spice Level: ${spiceLevel || "Medium"}
Price: $${price || "N/A"}

IMPORTANT RULES:
- Write an enticing, mouth-watering description (2-3 sentences)
- Tags must be accurate restaurant-style tags (e.g., ["spicy", "gluten-free", "popular"])
- Allergens must be realistic (e.g., ["dairy", "nuts", "gluten"])
- Serves must be realistic (1 or 2 people)
- bestFor must be meal timings only (e.g., ["lunch", "dinner", "brunch"])

Return ONLY valid JSON in this EXACT format (no markdown, no explanation):
{
  "description": "string",
  "tags": ["string"],
  "allergens": ["string"],
  "serves": "string",
  "bestFor": ["string"]
}`;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 300,
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
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("AI Service Error:", error.response?.data || error.message);
    // Return default description if AI fails
    return {
      description: `Delicious ${name} prepared with fresh ingredients and authentic flavors. A must-try dish!`,
      tags: ["popular", "signature"],
      allergens: [],
      serves: "1",
      bestFor: ["lunch", "dinner"],
    };
  }
};
