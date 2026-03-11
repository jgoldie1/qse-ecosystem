FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p /app/data /app/uploads/therapists /app/uploads/candidates /app/uploads/employers

EXPOSE 5000

CMD ["npm", "run", "start"]
