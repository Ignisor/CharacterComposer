# Build frontend (CRA)
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Install backend deps
FROM node:20 AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./

# Final image: Node serves API and static files via Express
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Copy backend (includes node_modules) and frontend build to expected path
COPY --from=backend-builder /app/backend /app/backend
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

# Cloud Run uses $PORT; default to 8080 for local runs
ENV PORT=8080
EXPOSE 8080

CMD ["node", "backend/index.js"]
