import dotenv from "dotenv";
dotenv.config();

import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";

const prompt1 = PromptTemplate.fromTemplate(
  "What is the star sign of people who are born in {Date}? Only Respond with the star sign"
);

const model = new ChatOpenAI({});

const outputParser = new StringOutputParser();

const chain = prompt1.pipe(model).pipe(outputParser);

const prompt2 = PromptTemplate.fromTemplate(
  "What are the features of the people who are {star_sign},Respond in {language}"
);

const combinedChain = RunnableSequence.from([
  {
    star_sign: chain,
    language: (input) => input.language,
  },
  prompt2,
  model,
  outputParser,
]);

const response = await combinedChain.invoke({
  Date: "2000-10-06",
  language: "English",
});

console.log(response);
