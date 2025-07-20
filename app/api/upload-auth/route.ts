import { getUploadAuthParams } from "@imagekit/next/server";

export async function GET() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY as string;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY as string;
  // Mask the private key for logging
  const maskedPrivateKey = privateKey
    ? privateKey.slice(0, 4) + "****" + privateKey.slice(-4)
    : "undefined";
  console.log("[ImageKit] Public Key:", publicKey);
  console.log("[ImageKit] Private Key (masked):", maskedPrivateKey);

  const { token, expire, signature } = getUploadAuthParams({
    privateKey,
    publicKey,
  });
  console.log("[ImageKit] Generated upload auth params:", {
    token,
    expire,
    signature,
    publicKey,
  });

  return Response.json({ token, expire, signature, publicKey });
}
