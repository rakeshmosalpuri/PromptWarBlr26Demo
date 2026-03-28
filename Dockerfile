# Base image for building the app
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Base image for serving the built app
FROM nginx:alpine

# Copy the built React app to Nginx's web directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# App Engine / Cloud Run requires exposing a port, usually 8080 or 80
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
