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
 * Intelligent regex parser to extract UPI/Bank transaction details from text
 */
export function parseTransactionText(
  rawText: string,
  expectedUtr?: string,
  expectedAmount?: number
): OcrAnalysisResult {
  let extractedUtr: string | null = null;
  let extractedAmount: number | null = null;
  let extractedDate: string | null = null;

  // 1. Extract UTR (12-digit number, UPI Ref, Txn ID)
  const utrPatterns = [
    /(?:UPI\s*Ref(?:\s*No|\s*ID)?|UTR|Txn\s*ID|Ref\s*No|Transaction\s*ID)[:\s#]*([A-Za-z0-9]{10,22})/i,
    /\b(\d{12})\b/, // Standard 12-digit Indian UPI Reference ID
    /\b([0-9]{4}\s+[0-9]{4}\s+[0-9]{4})\b/, // Spaced 12-digit
    /\b([A-Z0-9]{12,18})\b/,
  ];

  for (const pattern of utrPatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      extractedUtr = match[1].replace(/\s+/g, '');
      break;
    }
  }

  // If user entered expected UTR and it is found in text, confirm it
  if (expectedUtr && rawText.includes(expectedUtr)) {
    extractedUtr = expectedUtr;
  }

  // 2. Extract Amount (e.g. ₹300, ₹ 450.00, Rs. 300, INR 300)
  const amountPatterns = [
    /(?:₹|INR|Rs\.?|Amount)\s*[:]?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /(?:Paid\s*to|Debited)\s*(?:₹|INR|Rs\.?)?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
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

  // If expected amount is present in the raw text
  if (expectedAmount && (rawText.includes(expectedAmount.toString()) || rawText.includes(`₹${expectedAmount}`))) {
    extractedAmount = expectedAmount;
  }

  // 3. Extract Date / Time (e.g. 22 Aug 2026, 22/08/2026, 10:45 AM)
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

  // Calculate confidence score
  let score = 0;
  const utrMatched = !!(extractedUtr && expectedUtr && extractedUtr.toLowerCase() === expectedUtr.toLowerCase());
  const amountMatched = !!(extractedAmount && expectedAmount && Math.abs(extractedAmount - expectedAmount) < 1);
  const dateMatched = !!extractedDate;

  if (extractedUtr) score += 40;
  if (utrMatched) score += 25;
  if (extractedAmount) score += 20;
  if (amountMatched) score += 10;
  if (extractedDate) score += 5;

  const finalConfidence = Math.min(100, Math.max(score, extractedUtr ? 65 : 35));

  return {
    ocrUtr: extractedUtr,
    ocrAmount: extractedAmount,
    ocrDate: extractedDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    ocrConfidence: finalConfidence,
    rawText,
    matchedFields: {
      utrMatched,
      amountMatched,
      dateMatched,
    },
  };
}

/**
 * Process payment screenshot with Google Cloud Vision or simulated intelligence fallback
 */
export async function analyzePaymentScreenshot(
  imageUrl: string,
  userUtr: string,
  userAmount: number
): Promise<OcrAnalysisResult> {
  // If raw OCR text string is directly passed (e.g. unit test or pre-extracted OCR)
  if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
    return parseTransactionText(imageUrl, userUtr, userAmount);
  }

  const visionApiKey = process.env.GOOGLE_VISION_API_KEY;

  if (visionApiKey && imageUrl) {
    try {
      let imagePayload: any = null;

      if (imageUrl.startsWith('data:')) {
        // Base64 data URL
        const base64Data = imageUrl.split(',')[1] || imageUrl;
        imagePayload = { content: base64Data };
      } else if (imageUrl.startsWith('http')) {
        // Remote Cloud URL
        imagePayload = { source: { imageUri: imageUrl } };
      }

      if (imagePayload) {
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: [
                {
                  image: imagePayload,
                  features: [{ type: 'TEXT_DETECTION' }],
                },
              ],
            }),
          }
        );

        const data = await response.json();
        const detectedText = data?.responses?.[0]?.fullTextAnnotation?.text || '';
        if (detectedText) {
          return parseTransactionText(detectedText, userUtr, userAmount);
        }
      }
    } catch (err) {
      console.warn('Google Cloud Vision call error, using manual verification queue:', err);
    }
  }

  // Fallback: No Vision API key available or Vision call failed.
  // Return a manual-review result with the user-submitted UTR and amount.
  // Admin will verify the screenshot manually in the payment queue.
  return {
    ocrUtr: userUtr || null,
    ocrAmount: userAmount || null,
    ocrDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    ocrConfidence: 30, // Low confidence — needs manual admin verification
    rawText: '[OCR not available — manual verification required]',
    matchedFields: {
      utrMatched: false,
      amountMatched: false,
      dateMatched: false,
    },
  };
}
