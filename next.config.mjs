/** @type {import('next').NextConfig} */
const assetUrl =
  process.env.NEXT_PUBLIC_ASSETS_URL ||
  process.env.R2_PUBLIC_URL ||
  "https://assets.codeluxe.tech";

function buildRemotePattern(value) {
  try {
    const url = new URL(value);

    return {
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      port: url.port,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const remotePatterns = [assetUrl].map(buildRemotePattern).filter(Boolean);

const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
