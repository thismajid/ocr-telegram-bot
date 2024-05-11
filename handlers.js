import {
  getImageUrl,
  savePDF,
  extractTextFromPDF,
  performOCR,
} from "./utils.js";

async function processImage(ctx) {
  const loadingMsg = await ctx.reply("Processing your image...");
  const imageUrl = await getImageUrl(ctx);
  const text = await performOCR(imageUrl);
  ctx.api.editMessageText(
    ctx.chat.id,
    loadingMsg.message_id,
    `The text in the image is:\n\n${text}`
  );
}

async function processDocument(ctx) {
  const loadingMsg = await ctx.reply("Processing your document...");
  const pdfPath = await savePDF(ctx);
  if (pdfPath) {
    const text = await extractTextFromPDF(pdfPath);
    ctx.api.editMessageText(
      ctx.chat.id,
      loadingMsg.message_id,
      `The text in the PDF is:\n\n${text}`
    );
  } else {
    ctx.reply("Please send a PDF file or an image.");
  }
}

export { processImage, processDocument };
