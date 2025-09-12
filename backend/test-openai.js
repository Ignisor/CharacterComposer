import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const run = async () => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // <-- test with this model first
      messages: [{ role: "user", content: "Say hello world in JSON" }],
    });

    console.log("✅ Success! Response:");
    console.log(response.choices[0].message.content);
  } catch (err) {
    console.error("❌ Error from OpenAI:");
    console.error(err.response?.status, err.response?.statusText);
    console.error(err.response?.data || err.message);
  }
};

run();
