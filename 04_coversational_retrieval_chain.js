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

const condenseQuestionTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language. 

Chat History:{chat_history}
Follow up Input: {question}
Standalone Question:`;

const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(
  condenseQuestionTemplate
);

const formatChatHistory = (chatHistory) => {
  const formattedDialogueTurns = chatHistory.map(
    (dialogueTurn) => `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`
  );
  return formattedDialogueTurns.join("\n");
};

const standaloneQuestionChain = RunnableSequence.from([
  {
    question: (input) => input.question,
    chat_history: (input) => formatChatHistory(input.chat_history),
  },
  CONDENSE_QUESTION_PROMPT,
  model,
  new StringOutputParser(),
]);

const answerTemplate = `Answer the question based only on the following context:
{context}

Question: {question}`;

const ANSWER_PROMPT = PromptTemplate.fromTemplate(answerTemplate);

const vectorStore = await HNSWLib.fromTexts(
  [
    "mitochondria is the powerhouse of the cell",
    "mitochondria is made of lipids",
  ],
  [{ id: 1 }, { id: 2 }],
  new OpenAIEmbeddings()
);
const retriever = vectorStore.asRetriever(1);

const answerChain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough(),
  },
  ANSWER_PROMPT,
  model,
  new StringOutputParser(),
]);

const conversationalRetrievalQAChain =
  standaloneQuestionChain.pipe(answerChain);

const response1 = await conversationalRetrievalQAChain.invoke({
  question: "What is the powerhouse of the cell?",
  chat_history: [],
});

console.log("response without chat_hsitory :", "\n", response1);

const response2 = await conversationalRetrievalQAChain.invoke({
  question: "What are they made out of?",
  chat_history: [
    [
      "What is the powerhouse of the cell?",
      "The powerhouse of the cell is the mitochondria.",
    ],
  ],
});

console.log("response with chat_history knows who they are :", "\n", response2);
