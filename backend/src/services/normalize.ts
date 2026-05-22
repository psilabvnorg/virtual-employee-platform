import { ollamaChat, extractJson } from './llm/OllamaService';

const EXTRACT_PROMPTS: Record<string, string> = {
  invoice: `You are an accounting expert following Vietnamese Accounting Standards (VAS).
Extract structured data from the invoice OCR text. Return ONLY a valid JSON object with:
vendor, vendorTaxCode, invoiceNumber, invoiceDate (YYYY-MM-DD), dueDate, lineItems (array), subtotal, taxRate, taxAmount, totalAmount, currency.`,

  contract: `You are a legal and accounting expert.
Extract structured data from the contract OCR text. Return ONLY a valid JSON object with:
contractNumber, contractType, parties (array), effectiveDate, expiryDate, contractValue, currency, paymentTerms, keyObligations.`,

  certificate: `Extract structured data from the certificate OCR text.
Return ONLY a valid JSON object with: holderName, certificateType, issuer, issueDate, expiryDate, certificateNumber.`,

  'government-id': `Extract structured data from the government ID OCR text.
Return ONLY a valid JSON object with: fullName, idType, idNumber, dateOfBirth, expiryDate, issuingAuthority, nationality.`,

  receipt: `Extract structured data from the receipt OCR text.
Return ONLY a valid JSON object with: merchant, date, items (array of {name, qty, price}), subtotal, tax, total, paymentMethod.`,

  other: `Extract all key-value information from the document OCR text.
Return ONLY a valid JSON object with any relevant fields you can identify.`,
};

export interface NormalizeResult {
  raw: string;
  structured: Record<string, unknown> | null;
  status: 'done' | 'failed' | 'pending';
}

export async function normalize(rawText: string, category = 'other'): Promise<NormalizeResult> {
  const prompt = EXTRACT_PROMPTS[category] ?? EXTRACT_PROMPTS['other'];
  try {
    const response = await ollamaChat(prompt, rawText);
    const structured = extractJson(response);
    return { raw: rawText, structured, status: structured ? 'done' : 'failed' };
  } catch (err) {
    console.error('[normalize] Ollama error:', err);
    return { raw: rawText, structured: null, status: 'failed' };
  }
}
