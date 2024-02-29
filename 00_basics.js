import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

async function chat(input) {
  const messages = [{ role: "user", content: input }];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0,
  });
  return response.choices[0].message.content;
}

chat("What is the meaning of life?")
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
