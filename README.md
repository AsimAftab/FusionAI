# FusionAI - Multiple AI Models Platform

A modern web application that provides access to multiple AI models including GPT-5, powered by Azure AI Foundry.

## Features

- 🤖 **Multiple AI Models**: Access GPT-5, Image Generation, and Code Assistant
- 🔒 **Enterprise Security**: Built with security best practices
- ⚡ **High Performance**: Optimized for speed and reliability
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- 📱 **Mobile Friendly**: Fully responsive across all devices
- 🔧 **Easy Integration**: Simple setup with Azure AI Foundry

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Template Engine**: EJS
- **AI Platform**: Azure AI Foundry
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Font Awesome

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Azure AI Foundry account with API keys

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd FusionAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Azure AI Foundry credentials:
   ```env
   AZURE_AI_ENDPOINT=your-azure-ai-endpoint
   AZURE_AI_KEY=your-azure-ai-key
   AZURE_AI_DEPLOYMENT_NAME=gpt-5
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
FusionAI/
├── controllers/          # Route controllers (future use)
├── models/              # Data models (future use)
├── public/              # Static assets
│   ├── css/
│   │   ├── style.css    # Main styles
│   │   └── chat.css     # Chat-specific styles
│   └── js/
│       ├── main.js      # Landing page functionality
│       └── chat.js      # Chat functionality
├── routes/              # Express routes (future use)
├── views/               # EJS templates
│   ├── index.ejs        # Landing page
│   ├── chat.ejs         # Chat interface
│   └── 404.ejs          # Error page
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
├── server.js            # Main server file
└── README.md           # This file
```

## Configuration

### Azure AI Foundry Setup

1. **Create an Azure AI Foundry resource**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a new Azure AI Foundry resource
   - Note down the endpoint and API key

2. **Deploy GPT-5 model**
   - In Azure AI Foundry, deploy the GPT-5 model
   - Note the deployment name

3. **Update environment variables**
   ```env
   AZURE_AI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_AI_KEY=your-32-character-api-key
   AZURE_AI_DEPLOYMENT_NAME=your-gpt5-deployment-name
   ```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## API Endpoints

### Chat API
- **POST** `/api/chat`
  ```json
  {
    "message": "Your message here",
    "modelId": "gpt-5",
    "settings": {
      "temperature": 0.7,
      "maxTokens": 1000
    }
  }
  ```

### Health Check
- **GET** `/health` - Server health status

## Features Overview

### Landing Page
- Hero section with animated elements
- Model selection cards with hover effects
- Feature showcase
- Responsive navigation
- Performance optimized animations

### Chat Interface
- Real-time messaging with AI models
- Message history and persistence
- Configurable AI parameters (temperature, max tokens)
- Export chat functionality
- Typing indicators and smooth animations
- Keyboard shortcuts support

### AI Models Supported
1. **GPT-5 Chat** - Advanced conversational AI
2. **Image Generation** - Text-to-image creation
3. **Code Assistant** - Code generation and debugging

## Customization

### Adding New AI Models

1. **Update server.js**
   ```javascript
   const modelData = [
     // ... existing models
     {
       name: 'Your New Model',
       description: 'Model description',
       id: 'your-model-id',
       icon: 'fas fa-your-icon',
       features: ['Feature 1', 'Feature 2']
     }
   ];
   ```

2. **Add API integration** in the `/api/chat` endpoint

### Styling Customization

Edit CSS custom properties in `public/css/style.css`:
```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #8b5cf6;
  /* ... other variables */
}
```

## Security Considerations

- Environment variables for sensitive data
- Input validation and sanitization
- Rate limiting (to be implemented)
- CORS configuration
- XSS protection through proper content escaping

## Performance Features

- Lazy loading for images
- CSS and JS minification (production)
- Efficient DOM manipulation
- Smooth animations with CSS transforms
- Responsive images and icons

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## Roadmap

- [ ] User authentication and sessions
- [ ] Chat history persistence
- [ ] Advanced model parameters
- [ ] File upload support
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] API rate limiting
- [ ] Database integration
- [ ] Docker containerization

---

Built with ❤️ using Azure AI Foundry and modern web technologies.
