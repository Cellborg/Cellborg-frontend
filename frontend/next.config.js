/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')
const nextConfigDev = {
  reactStrictMode: true,
  env: {
    // pass in NEXTAUTH_URL env. var when deploying to beta/prod
    NEXTAUTH_SECRET: "gBsuHo9HV6D4zrF+HtLBQ1C8n9W7h37W5beOuDXBw0A=",
    NEXTAUTH_URL: "https://beta.cellborg.bio"

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
    NEXTAUTH_SECRET: "gBsuHo9HV6D4zrF+HtLBQ1C8n9W7h37W5beOuDXBw0A=",
    NEXTAUTH_URL: "https://beta.cellborg.bio"

  },
  images: {
    domains: ['images.unsplash.com',]
  },
  output: 'standalone'
}

module.exports = (phase, { defaultConfig }) => {
  console.log("----debug---Phase is ... ")
  console.log(phase)
  console.log(NEXTAUTH_URL)
  // see this https://github.com/vercel/next.js/blob/5e6b008b561caf2710ab7be63320a3d549474a5b/packages/next/shared/lib/constants.ts#L19-L23
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    console.log("Using nextConfigDev")
    return nextConfigDev
  }
 
  return nextConfig
}
