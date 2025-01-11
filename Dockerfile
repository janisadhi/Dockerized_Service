FROM node:alpine

WORKDIR /app

COPY . .

COPY package*.json package*.json 

COPY .env .env 

RUN npm install 

CMD ["npm","start"]
