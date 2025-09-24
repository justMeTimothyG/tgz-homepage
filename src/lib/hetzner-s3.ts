import { S3Client } from '@aws-sdk/client-s3';

let client: S3Client | null = null;

export function getHetznerS3Client(): S3Client {
  if (client) {
    return client;
  }

  const endpoint = process.env.HETZNER_S3_ENDPOINT ?? 'https://fsn1.your-objectstorage.com';
  const region = process.env.HETZNER_S3_REGION ?? 'eu-central-1';
  const accessKeyId = process.env.HETZNER_S3_ACCESS_KEY;
  const secretAccessKey = process.env.HETZNER_S3_SECRET_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing Hetzner Object Storage credentials (HETZNER_S3_ACCESS_KEY / HETZNER_S3_SECRET_KEY).');
  }

  client = new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return client;
}
