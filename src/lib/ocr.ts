export interface OcrAnalysisResult {
  ocrUtr: string | null;
  ocrAmount: number | null;
  ocrDate: string | null;
  ocrConfidence: number; // 0 - 100
  rawText: string;
  matchedFields: {
    utrMatched: boolean;
    amountMatched: boolean;
    dateMatched: boolean;
  };
}

/**
 * Clean string down to raw alphanumeric digits for strict matching
 */
function cleanDigits(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

/**
 * Intelligent regex parser to extract UPI/Bank transaction details from text
 * Supports PhonePe, GPay, Paytm, CRED, YONO, BHIM & All Indian UPI Apps
 */
export function parseTransactionText(
  rawText: string,
  expectedUtr?: string,
  expectedAmount?: number
): OcrAnalysisResult {
  let extractedUtr: string | null = null;
  let extractedAmount: number | null = null;
  let extractedDate: string | null = null;

  // 1. Extract UTR / Ref No / Txn ID across all Indian UPI App formats
  const utrPatterns = [
    /(?:UTR|UTR\s*No|UTR\s*ID|UPI\s*Ref|Ref\s*No|Ref\s*ID|Transaction\s*ID|Txn\s*ID|Google\s*Pay\s*ID)[:\s#]*([A-Za-z0-9]{10,24})/i,
    /\b(T\d{20,24})\b/i,
    /\b(\d{12})\b/,
    /\b([0-9]{4}\s+[0-9]{4}\s+[0-9]{4})\b/,
    /\b([A-Z0-9]{12,22})\b/,
  ];

  for (const pattern of utrPatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      extractedUtr = match[1].replace(/\s+/g, '');
      break;
    }
  }

  const cleanUserUtr = cleanDigits(expectedUtr);
  const cleanRawText = cleanDigits(rawText);
  const cleanExtractedUtr = cleanDigits(extractedUtr);

  const utrMatched = !!(
    cleanUserUtr.length >= 6 &&
    (cleanRawText.includes(cleanUserUtr) ||
      (cleanExtractedUtr && cleanExtractedUtr.includes(cleanUserUtr)) ||
      (cleanExtractedUtr && cleanUserUtr.includes(cleanExtractedUtr)))
  );

  if (utrMatched && (!extractedUtr || !extractedUtr.includes(expectedUtr!))) {
    extractedUtr = expectedUtr || extractedUtr;
  }

  // 2. Extract Fee Amount
  const amountPatterns = [
    /(?:₹|INR|Rs\.?|Amount)\s*[:]?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /(?:Paid\s*to|Debited|Total|Amount\s*Paid)\s*(?:₹|INR|Rs\.?)?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /\b(300|450|600|900)\b/,
  ];

  for (const pattern of amountPatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      const parsed = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0 && parsed < 100000) {
        extractedAmount = parsed;
        break;
      }
    }
  }

  const amountMatched = !!(
    expectedAmount &&
    (rawText.includes(expectedAmount.toString()) ||
      rawText.includes(`₹${expectedAmount}`) ||
      (extractedAmount && Math.abs(extractedAmount - expectedAmount) < 1))
  );

  if (amountMatched && !extractedAmount) {
    extractedAmount = expectedAmount || null;
  }

  // 3. Extract Date / Time
  const datePatterns = [
    /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}(?:,\s*\d{1,2}:\d{2}(?:\s*[AP]M)?)?)/i,
    /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?)/,
    /\b(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))\b/,
  ];

  for (const pattern of datePatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      extractedDate = match[1].trim();
      break;
    }
  }

  let score = 0;
  if (extractedUtr) score += 35;
  if (utrMatched) score += 40;
  if (extractedAmount) score += 15;
  if (amountMatched) score += 5;
  if (extractedDate) score += 5;

  return {
    ocrUtr: extractedUtr,
    ocrAmount: extractedAmount,
    ocrDate: extractedDate || null,
    ocrConfidence: score,
    rawText,
    matchedFields: {
      utrMatched,
      amountMatched,
      dateMatched: !!extractedDate,
    },
  };
}

/**
 * Analyze payment screenshot using server-side Tesseract.js OCR.
 */
export async function analyzePaymentScreenshot(
  imageUrl: string,
  userUtr: string,
  userAmount: number
): Promise<OcrAnalysisResult> {
  try {
    // We use the fast, free OCR.space API to prevent backend freezing,
    // avoid 30s delays, and bypass Google Vision billing issues.
    const formData = new FormData();
    formData.append('base64Image', imageUrl);
    formData.append('language', 'eng');
    formData.append('scale', 'true');
    formData.append('isOverlayRequired', 'false');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': 'helloworld', // Free public API key
      },
      body: formData,
    });

    const result = await response.json();
    
    if (result && result.ParsedResults && result.ParsedResults.length > 0) {
      const rawText = result.ParsedResults[0].ParsedText || '';
      
      if (rawText.trim().length > 5) {
        return parseTransactionText(rawText, userUtr, userAmount);
      }
    }
  } catch (error) {
    console.error('OCR.space fast API failed:', error);
  }

  // Fallback if OCR fails
  return {
    ocrUtr: null,
    ocrAmount: null,
    ocrDate: null,
    ocrConfidence: 0,
    rawText: '',
    matchedFields: {
      utrMatched: false,
      amountMatched: false,
      dateMatched: false,
    },
  };
}
