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
    // PhonePe UTR format: "UTR: 767445299041" or "UTR 767445299041"
    /(?:UTR|UTR\s*No|UTR\s*ID|UPI\s*Ref|Ref\s*No|Ref\s*ID|Transaction\s*ID|Txn\s*ID|Google\s*Pay\s*ID)[:\s#]*([A-Za-z0-9]{10,24})/i,
    // PhonePe Transaction ID starting with T: e.g. T23081032220395606346477
    /\b(T\d{20,24})\b/i,
    // Standard 12-digit Indian UPI Reference ID (e.g., 423456789012 or 767445299041)
    /\b(\d{12})\b/,
    // Spaced 12-digit (e.g. 4234 5678 9012)
    /\b([0-9]{4}\s+[0-9]{4}\s+[0-9]{4})\b/,
    // Alphanumeric 10-22 char codes
    /\b([A-Z0-9]{12,22})\b/,
  ];

  for (const pattern of utrPatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      extractedUtr = match[1].replace(/\s+/g, '');
      break;
    }
  }

  // Check if expected UTR or clean digits are present in raw OCR text
  const cleanUserUtr = cleanDigits(expectedUtr);
  const cleanRawText = cleanDigits(rawText);
  const cleanExtractedUtr = cleanDigits(extractedUtr);

  const utrMatched = !!(
    cleanUserUtr.length >= 6 &&
    (cleanRawText.includes(cleanUserUtr) ||
      (cleanExtractedUtr && cleanExtractedUtr.includes(cleanUserUtr)) ||
      (cleanExtractedUtr && cleanUserUtr.includes(cleanExtractedUtr)))
  );

  // If user UTR is directly matched in raw OCR text, assign it if pattern extraction missed exact digits
  if (utrMatched && (!extractedUtr || !extractedUtr.includes(expectedUtr!))) {
    extractedUtr = expectedUtr || extractedUtr;
  }

  // 2. Extract Fee Amount (e.g. ₹300, ₹ 300.00, Rs. 300, 300)
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

  // Calculate real confidence score
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
 * Process payment screenshot with Google Cloud Vision API
 * Always sends raw Base64 bytes directly so HTTP/Cloud URLs never fail
 */
export async function analyzePaymentScreenshot(
  imageUrl: string,
  userUtr: string,
  userAmount: number
): Promise<OcrAnalysisResult> {
  // If raw text string is directly passed
  if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
    return parseTransactionText(imageUrl, userUtr, userAmount);
  }

  const visionApiKey = process.env.GOOGLE_VISION_API_KEY;

  if (visionApiKey && imageUrl) {
    try {
      let base64Content: string | null = null;

      if (imageUrl.startsWith('data:')) {
        base64Content = imageUrl.split(',')[1] || imageUrl;
      } else if (imageUrl.startsWith('http')) {
        // Fetch remote image bytes into buffer
        const imgRes = await fetch(imageUrl);
        const arrayBuf = await imgRes.arrayBuffer();
        base64Content = Buffer.from(arrayBuf).toString('base64');
      }

      if (base64Content) {
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: [
                {
                  image: { content: base64Content },
                  features: [{ type: 'TEXT_DETECTION' }],
                },
              ],
            }),
          }
        );

        const data = await response.json();
        if (data?.error) {
          console.error('Google Cloud Vision API Error:', data.error);
        }

        const detectedText = data?.responses?.[0]?.fullTextAnnotation?.text || '';
        if (detectedText) {
          return parseTransactionText(detectedText, userUtr, userAmount);
        }
      }
    } catch (err) {
      console.error('Google Cloud Vision fetch exception:', err);
    }
  } else {
    console.warn('GOOGLE_VISION_API_KEY is not set or imageUrl is empty.');
  }

  // Fallback: No Vision API key or API call returned empty text.
  return {
    ocrUtr: null,
    ocrAmount: null,
    ocrDate: null,
    ocrConfidence: 0,
    rawText: '[OCR pending manual admin verification]',
    matchedFields: {
      utrMatched: false,
      amountMatched: false,
      dateMatched: false,
    },
  };
}
