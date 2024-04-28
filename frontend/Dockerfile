# Builder stage
FROM node:20.4.0-alpine as builder

RUN apk add --no-cache build-base python3

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build-beta

# Runner stage
FROM node:20.4.0-alpine as runner

WORKDIR /app
ENV NODE_ENV production
ENV NEXT_PUBLIC_DEPLOY_ENV beta

# It's important to copy the entire .next directory and node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
# Copy the standalone next application and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
