import dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

const prompt = PromptTemplate.fromTemplate("Tell me a joke about {topic}");

const model = new ChatOpenAI({});

const functionSchema = [
  {
    name: "joke",
    description: "a joke about a topic",
    parameters: {
      type: "object",
      properties: {
        intro: {
          type: "string",
          description: "Introduce youself as a comdeian",
        },
        setup: {
          type: "string",
          description: "The setup of the joke",
        },
        punchline: {
          type: "string",
          description: "The punchline of the joke",
        },
      },
      required: ["intro", "setup", "punchline"],
    },
  },
];

const chain = prompt.pipe(
  model.bind({
    functions: functionSchema,
    function_call: { name: "joke" },
  })
);

const response = await chain.invoke({ topic: "ice cream" });

console.log(response);
