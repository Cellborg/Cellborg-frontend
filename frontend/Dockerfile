FROM node:20.4.0-alpine as builder

RUN apk add --no-cache build-base python3

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install sharp
COPY . .
RUN npm run build-beta

FROM node:20.4.0-alpine as runner
WORKDIR /app
#ENV NODE_ENV beta
ENV NEXT_PUBLIC_DEPLOY_ENV beta

# COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV NEXT_SHARP_PATH=/tmp/node_modules/sharp
ENV NEXTAUTH_URL=https://beta.cellborg.bio

CMD ["node", "server.js"]