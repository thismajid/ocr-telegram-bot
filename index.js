import { Bot } from "grammy";
import dotenv from "dotenv";

import { processImage, processDocument } from "./handlers.js";
import { createDirectory, getMessageType } from "./utils.js";

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

(() => {
  const pdfImagesDir = "./temp/pdf_images";
  createDirectory(pdfImagesDir);
  const pdfDir = "./temp/pdf";
  createDirectory(pdfDir);
})();

bot.command("start", (ctx) => {
  ctx.reply(
    "Hi! Send me an image or a PDF, and I will extract the text from it."
  );
});

bot.on("message", async (ctx) => {
  const messageType = getMessageType(ctx.message);
  if (messageType === "photo") {
    await processImage(ctx);
  } else if (messageType === "document") {
    await processDocument(ctx);
  } else {
    ctx.reply(
      "Please send an image or a PDF file, and I will extract the text from it."
    );
  }
});

bot
  .start()
  .then(() => {
    console.log("Bot started.");
  })
  .catch((error) => {
    console.error("Error starting bot:", error);
  });

process.once("SIGINT", () => {
  bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
});
