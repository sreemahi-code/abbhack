# Stage 1: build
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build -- --output-path=dist --configuration=production

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/ /usr/share/nginx/html

# Optional: copy a custom nginx conf if you have one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
