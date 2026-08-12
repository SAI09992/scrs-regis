const { createWorker } = require('tesseract.js');

async function testTesseract() {
  console.log('Testing Tesseract.js OCR engine with buffer...');
  const worker = await createWorker('eng');
  const res = await fetch('https://raw.githubusercontent.com/tesseract-ocr/test/main/testing/eurotext.png');
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ret = await worker.recognize(buffer);
  console.log('Tesseract Text Detected:', ret.data.text.slice(0, 100));
  await worker.terminate();
}

testTesseract();
