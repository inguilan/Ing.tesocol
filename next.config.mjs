/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  images: {
    unoptimized: true,
  },
}

export default nextConfig
