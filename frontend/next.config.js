/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

const ENV = process.env.NEXT_PUBLIC_DEPLOY_ENV || "dev"// Ensure this points to the correct path

const nextConfigDev = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_SECRET: "gBsuHo9HV6D4zrF+HtLBQ1C8n9W7h37W5beOuDXBw0A=",
    NEXTAUTH_URL: "http://localhost:3000"
  },
  images: {
    domains: ['images.unsplash.com']
  },
  output: 'standalone'
};

const nextConfigProd = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_SECRET: "gBsuHo9HV6D4zrF+HtLBQ1C8n9W7h37W5beOuDXBw0A=",
    NEXTAUTH_URL: "https://beta.cellborg.bio"
  },
  images: {
    domains: ['images.unsplash.com']
  },
  output: 'standalone'
};

/*// Debug logging for environment check
console.log("Environment Variable ENVV is:", ENV);

const getNextConfig = () => {
  if (ENV === 'dev') {
    console.log("Using Development Config");
    return nextConfigDev;
  } else {
    console.log("Using Production Config");
    return nextConfigProd;
  }
};

module.exports = getNextConfig();*/

module.exports = {
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
