FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# In production, we would use:
# RUN npm run build
# CMD ["npm", "start"]

# For development:
CMD ["npm", "run", "dev"]
