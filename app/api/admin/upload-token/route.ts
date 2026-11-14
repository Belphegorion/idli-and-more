import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobToken || blobToken === 'vercel_blob_rw_token_placeholder') {
      // In local development or before Vercel Blob is provisioned, return a friendly dev mock
      return NextResponse.json({
        mock: true,
        message: 'BLOB_READ_WRITE_TOKEN not provisioned yet. Set BLOB_READ_WRITE_TOKEN in .env.local to enable direct Vercel Blob cloud uploads.',
      });
    }

    const body = (await req.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          maximumSizeInBytes: 5 * 1024 * 1024, // 5MB max after browser WebP compression
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Vercel Blob upload completed successfully:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error('Error in /api/admin/upload-token:', error);
    return NextResponse.json({ error: error.message || 'Failed to issue upload token' }, { status: 500 });
  }
}
