/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')
const nextConfigDev = {
  reactStrictMode: true,
  env: {
    // pass in NEXTAUTH_URL env. var when deploying to beta/prod
    NEXTAUTH_SECRET: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
    NEXTAUTH_URL: "http://localhost:3000"

  },
  images: {
    domains: ['images.unsplash.com',]
  },
  output: 'standalone'
}
const nextConfig = {
  reactStrictMode: true,
  env: {
    // pass in NEXTAUTH_URL env. var when deploying to beta/prod
    NEXTAUTH_SECRET: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
    NEXTAUTH_URL: "https://beta.cellborg.bio"

  },
  images: {
    domains: ['images.unsplash.com',]
  },
  output: 'standalone'
}

module.exports = (phase, { defaultConfig }) => {
  // see this https://github.com/vercel/next.js/blob/5e6b008b561caf2710ab7be63320a3d549474a5b/packages/next/shared/lib/constants.ts#L19-L23
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return nextConfigDev
  }
 
  return nextConfig
}
