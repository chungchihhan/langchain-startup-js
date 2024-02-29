// Basic example: prompt + model + output parser

import dotenv from "dotenv";
dotenv.config();

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = ChatPromptTemplate.fromMessages([
  ["human", "Tell me a joke about {topic}"],
]);

const model = new ChatOpenAI({
  temperature: 0.9,
});

const outputParser = new StringOutputParser();

// In this line we're chaining our prompt, LLM model and output parser together:
const chain = prompt.pipe(model).pipe(outputParser);

const response = await chain.invoke({
  topic: "ice cream",
});

console.log(response);
