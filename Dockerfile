FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20 AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
RUN npm install playwright
RUN npx playwright install --with-deps
CMD ["node", "dist/fetch-all.js"]