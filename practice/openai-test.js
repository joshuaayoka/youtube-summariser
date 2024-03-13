const openAI = require("openai");
const express = require("express")
const app = express()


const openai = new openAI.OpenAI({apiKey: process.env.OPENAI_API_KEY})

async function runPrompt() {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "Tell me a joke" }],
        model: "gpt-3.5-turbo",
      });

    console.log(completion.choices)
}
runPrompt()
