import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';

import { getHetznerS3Client } from '@/lib/hetzner-s3';

const bucket = process.env.HETZNER_S3_BUCKET;

function isInvalidKey(key: string): boolean {
  if (!key) return true;
  const segments = key.split('/');
  return segments.some((segment) => segment.length === 0 || segment === '.' || segment === '..');
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<Record<string, string | string[] | undefined>> },
) {
  const resolvedParams = await context.params;
  const rawKey = resolvedParams?.['key'];
  const keySegments = (Array.isArray(rawKey) ? rawKey : rawKey ? [rawKey] : [])
    .filter((segment): segment is string => Boolean(segment));
  const objectKey = keySegments.join('/');
  const normalizedKey = objectKey.replace(/^\/+/, '');

  if (isInvalidKey(normalizedKey)) {
    return NextResponse.json({ error: 'Invalid object key' }, { status: 400 });
  }

  if (!bucket) {
    return NextResponse.json({ error: 'Missing HETZNER_S3_BUCKET environment variable' }, { status: 500 });
  }

  let client;
  try {
    client = getHetznerS3Client();
  } catch (error) {
    console.error('Hetzner S3 client error', error);
    return NextResponse.json({ error: 'Object storage is not configured' }, { status: 500 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: normalizedKey,
    });

    const result = await client.send(command);

    if (!result.Body) {
      return NextResponse.json({ error: 'Empty response from object storage' }, { status: 502 });
    }

    const readable = toWebStream(result.Body);

    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    if (result.ContentType) headers.set('Content-Type', result.ContentType);
    if (result.ContentLength != null) headers.set('Content-Length', String(result.ContentLength));
    if (result.ETag) headers.set('ETag', result.ETag.replaceAll('"', ''));
    if (result.LastModified) headers.set('Last-Modified', result.LastModified.toUTCString());

    return new NextResponse(readable, {
      status: 200,
      headers,
    });
  } catch (error) {
    const status = Number((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode ?? 500);
    const message = status === 404 ? 'Image not found' : 'Failed to fetch image from storage';
    console.error('Hetzner image proxy error', error);
    return NextResponse.json({ error: message }, { status });
  }
}

function toWebStream(body: unknown): ReadableStream<Uint8Array> {
  if (!body) {
    throw new Error('Cannot convert empty body to stream');
  }

  if (body instanceof Readable) {
    return Readable.toWeb(body) as ReadableStream<Uint8Array>;
  }

  if (typeof (body as { transformToWebStream?: () => ReadableStream<Uint8Array> }).transformToWebStream === 'function') {
    return (body as { transformToWebStream: () => ReadableStream<Uint8Array> }).transformToWebStream();
  }

  if (body instanceof Uint8Array) {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(body);
        controller.close();
      },
    });
  }

  throw new Error(`Unsupported body type: ${typeof body}`);
}
