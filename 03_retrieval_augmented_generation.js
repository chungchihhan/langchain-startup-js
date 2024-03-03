import dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { formatDocumentsAsString } from "langchain/util/document";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOpenAI({});

const documents = [
  { text: "mitochondria is the powerhouse of the cell", id: 1 },
  {
    text: "Photosynthesis is the process by which plants make their food.",
    id: 2,
  },
  {
    text: "DNA is the molecule that carries the genetic instructions in all living organisms.",
    id: 3,
  },
];

const vectorStore = await HNSWLib.fromTexts(
  documents.map((doc) => doc.text),
  documents.map((doc) => ({ id: doc.id })),
  new OpenAIEmbeddings()
);

const k = 1; // Number of documents to retrieve
const retriever = vectorStore.asRetriever(k);

const prompt = PromptTemplate.fromTemplate(
  "Anser the question based only on the following context: {context} Question: {question}"
);

const chain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocumentsAsString), //pipe 方法會將 retriever 的輸出（即檢索到的文檔）傳遞給 formatDocumentsAsString 函數，formatDocumentsAsString 會將文檔格式化為字符串。
    question: new RunnablePassthrough(),
  },
  prompt,
  model,
  new StringOutputParser(),
]);

const result = await chain.invoke("What is the powerhouse of the cell?");
console.log(result);
