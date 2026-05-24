const { GoogleGenAI } = require('@google/genai');

const generateTaskBreakdown = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ message: "GEMINI_API_KEY is missing in .env" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
You are a project management AI assistant. I have a task titled "${title}".
The description is: "${description || 'None provided'}".
Please break this task down into a logical step-by-step checklist of 5-10 items.
Return ONLY a valid JSON array of strings. No markdown, no code blocks, just the raw JSON array.
Example: ["Step 1", "Step 2", "Step 3"]
    `;

    // Try multiple models with retry
    const models = [
      'gemini-2.5-flash',
      'gemini-2.0-flash', 
      'gemini-1.5-flash-latest',
      'gemini-pro'
    ];
    
    let lastError = null;

    for (const model of models) {
      // Try each model up to 2 times
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          console.log(`Trying AI model: ${model} (attempt ${attempt + 1})`);
          const response = await ai.models.generateContent({
            model,
            contents: prompt
          });

          const text = response.text;
          let cleanText = text.trim();
          if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
          }
          
          const checklistItems = JSON.parse(cleanText);
          console.log(`AI Success with model: ${model}`);
          return res.status(200).json({ checklistItems });
        } catch (modelError) {
          console.log(`Model ${model} attempt ${attempt + 1} failed: ${modelError.status || modelError.message}`);
          lastError = modelError;
          
          // If 503 (overloaded), wait 2 seconds before retry
          if (modelError.status === 503) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          // If 404 (model not found), skip to next model immediately
          if (modelError.status === 404) {
            break;
          }
          continue;
        }
      }
    }

    // All models failed — return a hardcoded smart breakdown as final fallback
    console.log('All AI models failed. Using local fallback.');
    const fallbackChecklist = generateLocalBreakdown(title, description);
    return res.status(200).json({ checklistItems: fallbackChecklist });
    
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ message: "Failed to generate AI breakdown", error: error.message });
  }
};

// Local fallback: generates a reasonable checklist without AI
function generateLocalBreakdown(title, description) {
  const lowerTitle = (title || '').toLowerCase();
  
  // Common development task patterns
  if (lowerTitle.includes('auth') || lowerTitle.includes('login') || lowerTitle.includes('register')) {
    return [
      "Design the UI for login and registration forms",
      "Set up form validation (email format, password strength)",
      "Create backend API routes for /register and /login",
      "Implement password hashing with bcrypt",
      "Generate and return JWT tokens on successful login",
      "Create auth middleware to protect private routes",
      "Store token in localStorage/cookies on frontend",
      "Add error handling and user feedback (toast messages)",
      "Test edge cases (duplicate email, wrong password)",
      "Add logout functionality and token cleanup"
    ];
  }
  
  if (lowerTitle.includes('payment') || lowerTitle.includes('checkout') || lowerTitle.includes('razorpay') || lowerTitle.includes('stripe')) {
    return [
      "Set up payment gateway account and get API keys",
      "Install payment SDK on backend",
      "Create order/payment creation API endpoint",
      "Build checkout UI with order summary",
      "Integrate payment button/form on frontend",
      "Handle payment success callback",
      "Handle payment failure and retries",
      "Update order status in database after payment",
      "Send confirmation email/notification to user",
      "Test with sandbox/test mode before going live"
    ];
  }
  
  if (lowerTitle.includes('design') || lowerTitle.includes('wireframe') || lowerTitle.includes('ui') || lowerTitle.includes('figma')) {
    return [
      "Research design inspiration and competitor UIs",
      "Define color palette and typography",
      "Create low-fidelity wireframes",
      "Design high-fidelity mockups in Figma",
      "Create responsive layouts for mobile and tablet",
      "Design all interactive states (hover, active, disabled)",
      "Get stakeholder feedback and iterate",
      "Export assets and prepare design handoff"
    ];
  }

  if (lowerTitle.includes('api') || lowerTitle.includes('backend') || lowerTitle.includes('database') || lowerTitle.includes('schema')) {
    return [
      "Define data models and database schema",
      "Set up database connection and config",
      "Create CRUD API endpoints",
      "Add input validation and sanitization",
      "Implement error handling middleware",
      "Add authentication/authorization checks",
      "Write API documentation",
      "Test all endpoints with Postman or similar tool"
    ];
  }

  if (lowerTitle.includes('test') || lowerTitle.includes('review') || lowerTitle.includes('qa')) {
    return [
      "Define test cases and acceptance criteria",
      "Test all happy path scenarios",
      "Test edge cases and error handling",
      "Test on different browsers and devices",
      "Check accessibility (keyboard nav, screen readers)",
      "Performance testing under load",
      "Fix any bugs found during testing",
      "Get final sign-off from stakeholders"
    ];
  }
  
  // Generic fallback for any task
  return [
    `Research and gather requirements for: ${title}`,
    "Break down the task into smaller subtasks",
    "Set up the development environment",
    "Implement the core functionality",
    "Add error handling and edge cases",
    "Write unit tests",
    "Code review and refactoring",
    "Test thoroughly on all platforms",
    "Document the implementation",
    "Deploy and verify in production"
  ];
}

module.exports = { generateTaskBreakdown };
