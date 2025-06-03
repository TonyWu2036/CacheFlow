export const generateAIQuestions = async (prompt) => {
  console.log("Making API request to Perplexity...");
  
  try {
    const response = await fetch('http://localhost:3001/api/perplexity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ 
          role: "user", 
          content: prompt
        }],
        response_format: {
          type: "json_schema",
          json_schema: {
            schema: {
              type: "object",
              properties: {
                LEVEL_1: {
                  type: "object",
                  properties: {
                    word_matching: {
                      type: "object",
                      properties: {
                        Fruits: { type: "array" },
                        Vegetables: { type: "array" },
                        Animals: { type: "array" },
                        Places: { type: "array" },
                        Colors: { type: "array" },
                        Vehicles: { type: "array" },
                        Clothing: { type: "array" }
                      }
                    },
                    grammar_challenge: { type: "array" },
                    complete_sentence: { type: "array" }
                  }
                },
                LEVEL_2: {
                  type: "object",
                  properties: {
                    word_matching: {
                      type: "object",
                      properties: {
                        Fruits: { type: "array" },
                        Vegetables: { type: "array" },
                        Animals: { type: "array" },
                        Places: { type: "array" },
                        Colors: { type: "array" },
                        Vehicles: { type: "array" },
                        Clothing: { type: "array" }
                      }
                    },
                    grammar_challenge: { type: "array" },
                    complete_sentence: { type: "array" }
                  }
                },
                LEVEL_3: {
                  type: "object",
                  properties: {
                    word_matching: {
                      type: "object",
                      properties: {
                        Fruits: { type: "array" },
                        Vegetables: { type: "array" },
                        Animals: { type: "array" },
                        Places: { type: "array" },
                        Colors: { type: "array" },
                        Vehicles: { type: "array" },
                        Clothing: { type: "array" }
                      }
                    },
                    grammar_challenge: { type: "array" },
                    complete_sentence: { type: "array" }
                  }
                }
              }
            }
          }
        },
        temperature: 0.3,
        max_tokens: 8000
      })
    });

    const data = await response.json();
    console.log("Raw API response:", data);
    
    const content = data.choices[0].message.content;
    console.log("Raw content:", content);
    
    const result = JSON.parse(content);
    console.log("Parsed result:", result);
    return result;

  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
