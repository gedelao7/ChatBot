# Course Chatbot

A responsive chatbot application that helps students interact with course content through a chat interface, flashcards, quizzes, and external resources.

## Features

- **Chat Interface**: Ask questions about course content
- **Flashcards**: Generate study flashcards from course material
- **Quizzes**: Test your knowledge with auto-generated quizzes
- **External Resources**: Access supplementary learning materials

## Technical Stack

- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Backend**: Express.js, Node.js
- **AI Integration**: OpenAI API
- **Deployment**: Netlify (serverless functions)

## Local Development

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd chatbot
```

2. Install dependencies
```bash
npm install
```

3. Install function dependencies
```bash
cd functions-src
npm install
cd ..
```

4. Create a `.env` file in the root directory (for local development)
```
OPENAI_API_KEY=your_openai_api_key
```

5. Start the development server
```bash
npm run netlify:dev
```

6. Visit `http://localhost:8888` in your browser

## Deployment

### Deploying to Netlify

1. Make sure you have the Netlify CLI installed
```bash
npm install -g netlify-cli
```

2. Log in to your Netlify account
```bash
netlify login
```

3. Use the deployment script
```bash
chmod +x deploy-netlify.sh
./deploy-netlify.sh
```

### Manual Deployment

1. Build the serverless functions
```bash
npm run build
```

2. Deploy to Netlify
```bash
netlify deploy --prod
```

### Environment Variables

Set these environment variables in the Netlify dashboard:

- `OPENAI_API_KEY`: Your OpenAI API key

## Project Structure

```
chatbot/
├── functions-src/          # Serverless function source code
│   ├── api.js              # Main API function
│   └── package.json        # Function dependencies
├── public/                 # Static frontend files
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript files
│   └── index.html          # Main HTML file
├── package.json            # Project dependencies
└── netlify.toml            # Netlify configuration
```

## Development Notes

- The application uses serverless functions for the backend API
- Local development simulates the Netlify serverless environment
- The UI is responsive and works on mobile devices

## Customization

To customize the chat content:

1. Update the sample transcript in `functions-src/api.js`
2. Add more resources in the videos endpoint
3. Modify the system prompts to change the assistant's behavior

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenAI for providing the GPT API
- Bootstrap for the UI framework
- Express.js for the API server
- Netlify for hosting and serverless functions 