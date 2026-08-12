import { put } from '@vercel/blob';

/**
 * Uploads payment screenshot to Vercel Blob or provides a secure local data URI fallback
 */
export async function uploadScreenshotBlob(
  file: File | Blob,
  fileName: string
): Promise<string> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (blobToken && blobToken.startsWith('vercel_blob_rw_') && blobToken !== 'vercel_blob_rw_local_token') {
    try {
      const blob = await put(`payments/${Date.now()}-${fileName}`, file, {
        access: 'public',
        token: blobToken,
      });
      return blob.url;
    } catch (err) {
      console.warn('Vercel Blob upload failed, falling back to secure data URL storage:', err);
    }
  }

  // Fallback: Convert file buffer to Data URL so uploads work seamlessly in any environment
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = file.type || 'image/png';
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}
