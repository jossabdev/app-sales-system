FROM node:18
WORKDIR /app
RUN apt update && apt install tzdata -y
ENV TZ="America/Guayaquil"
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --prod
EXPOSE 4200
CMD ["npm", "start"]
