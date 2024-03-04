import dotenv from "dotenv";
dotenv.config();

import { BufferMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({});
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful chatbot"],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const memory = new BufferMemory({
  returnMessages: true,
  inputKey: "input",
  outputKey: "output",
  memoryKey: "history",
});

console.log(await memory.loadMemoryVariables({}));

const chain = RunnableSequence.from([
  {
    input: (initialInput) => initialInput.input,
    memory: () => memory.loadMemoryVariables({}),
  },
  {
    input: (previousOutput) => previousOutput.input,
    history: (previousOutput) => previousOutput.memory.history,
  },
  prompt,
  model,
]);

const inputs = {
  input: "Hey,I'm Bob!",
};

const response = await chain.invoke(inputs);

console.log(response);

await memory.saveContext(inputs, {
  output: response.content,
});

console.log(await memory.loadMemoryVariables({}));

const inputs2 = {
  input: "What's my name?",
};

const response2 = await chain.invoke(inputs2);

console.log(response2);
