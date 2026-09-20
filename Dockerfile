# Stage 1: Build the React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

# Install dependencies first for caching
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend code and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve Backend and Frontend using Python
FROM python:3.11-slim
WORKDIR /app

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the backend source files
COPY backend/ ./backend/

# Copy the built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose the port that prod_server.py listens on
EXPOSE 8080

# Start the production server
CMD ["python", "backend/prod_server.py"]
