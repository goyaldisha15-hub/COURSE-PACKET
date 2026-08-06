FROM node:20

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install --build-from-source=sqlite3

COPY . .

EXPOSE 5000

ENV PORT=5000
CMD ["node", "server.js"]
