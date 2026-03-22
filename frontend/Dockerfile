FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install

# Accept Razorpay key at build time
ARG VITE_RAZORPAY_KEY_ID
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]