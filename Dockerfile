FROM node:18-alpine

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S fusionai -u 1001

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Create necessary directories with proper permissions
RUN mkdir -p uploads/temp logs
RUN chown -R fusionai:nodejs /app

# Copy app source
COPY --chown=fusionai:nodejs . .

# Create .gitkeep files for empty directories
RUN touch uploads/temp/.gitkeep logs/.gitkeep

# Expose port
EXPOSE 3001

# Switch to non-root user
USER fusionai

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
  const req = http.request({hostname: 'localhost', port: 3001, path: '/health'}, (res) => { \
    process.exit(res.statusCode === 200 ? 0 : 1); \
  }); \
  req.on('error', () => process.exit(1)); \
  req.end();"

# Start the application
CMD ["npm", "start"]
