import { createWorker } from "tesseract.js";
import fs from "fs";
import { promisify } from "util";
import axios from "axios";
import * as filepix from "filepix";

async function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function getImageUrl(ctx) {
  const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
  const file = await ctx.api.getFile(fileId);
  return `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
}

async function savePDF(ctx) {
  const fileId = ctx.message.document.file_id;
  const file = await ctx.api.getFile(fileId);
  const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
  const filePath = `./temp/pdf/${file.file_id}.pdf`;
  await downloadFile(fileUrl, filePath);
  return filePath;
}

async function extractTextFromPDF(pdfPath) {
  if (isPDF(pdfPath)) {
    const imagePaths = await convertPDFToImages(pdfPath);
    const textResults = await Promise.all(imagePaths.map(performOCR));
    return textResults.join("\n");
  } else {
    return null;
  }
}

async function performOCR(imagePath) {
  const worker = await createWorker("eng", 1, {
    logger: (m) => console.log(m),
  });
  const {
    data: { text },
  } = await worker.recognize(imagePath);
  await worker.terminate();
  return text;
}

async function downloadFile(url, filePath) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  await promisify(fs.writeFile)(filePath, Buffer.from(response.data));
}

function isPDF(filePath) {
  const fileExtension = filePath.split(".").pop();
  return fileExtension.toLowerCase() === "pdf";
}

async function convertPDFToImages(pdfPath) {
  const imageDir = `./temp/pdf_images/${Date.now()}/`;
  createDirectory(imageDir);
  await filepix.PDF2img(pdfPath, imageDir);
  return getAllFiles(imageDir);
}

function getAllFiles(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((item) => !item.isDirectory())
    .map((item) => `${dirPath}${item.name}`);
}

function getMessageType(message) {
  if (message.photo) {
    return "photo";
  } else if (message.document) {
    return "document";
  } else {
    return null;
  }
}

export {
  createDirectory,
  getImageUrl,
  savePDF,
  extractTextFromPDF,
  performOCR,
  getMessageType,
};
