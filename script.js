// Wait for the DOM to load before running the chatbot code
document.addEventListener("DOMContentLoaded", () => {
  // Get references to the form, input, and chat window elements
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatWindow = document.getElementById("chatWindow");

  // If any required element is missing, show an error and stop
  if (!chatForm || !userInput || !chatWindow) {
    alert("Error: Required chat elements not found in the HTML.");
    return;
  }

  // Store the conversation history for the chat
  const messages = [
    {
      role: "system",
      // This prompt sets the bot's personality and expertise
      content:
        "You are the L'Oreal support tech. You are friendly and a little sassy in a fun way like a stylist, and are very knowledgeable about the materials and processes of a quality makeup routine, skincare routine, and beauty secrets overall. You can answer questions related to the usage order of products, make L'Oreal recommendations, discuss ingredients, and you give detailed and fun answers to satisfy the customer's beauty needs. The L'Oreal brand voice is professional and connected to the consumer. You have limited yourself to only answering questions related to L'Oreal and their products/brand because of your passion for it, so you refuse any question that cannot be related back to the brand. If the user asks a question related to the privacy policy, terms of use, or contact information, you provide the relevant links and/or reference their location at the footer of the page, including the one you are on.",
    },
  ];

  // Show a welcome message when the page loads
  chatWindow.textContent = "👋 Hello! How can I help you today?";

  // This function updates the chat window with the conversation history
  function renderChat() {
    // Clear the chat window
    chatWindow.innerHTML = "";

    // Loop through all messages except the system message
    for (const msg of messages) {
      // Create a new div for each message
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("msg");

      // Add a class based on the message role (user or assistant)
      if (msg.role === "user") {
        messageDiv.classList.add("user");
        messageDiv.textContent = msg.content;
      } else if (msg.role === "assistant") {
        messageDiv.classList.add("ai");
        messageDiv.textContent = msg.content;
      }

      // Append the message bubble to the chat window
      chatWindow.appendChild(messageDiv);
    }

    // Scroll to the bottom so the latest message is visible
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Listen for form submission (when the user sends a message)
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage();
  });

  // The URL of your Cloudflare worker (acts as a proxy to OpenAI API)
  const workerURL = "https://broad-thunder-8222.ashagirl409.workers.dev/";

  // This function sends the user's message to the API and displays the response
  async function sendMessage() {
    // Get the user's message from the input field
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Add user's message to the conversation history
    messages.push({ role: "user", content: userMessage });

    // Show the updated chat and a "thinking" message
    renderChat();
    chatWindow.textContent += `\nL'OrealAssistant: Gathering Information...`;

    // Clear the input field for the next message
    userInput.value = "";

    // Prepare the payload for the API request (include all messages)
    const payload = {
      model: "gpt-4o", // Use OpenAI's gpt-4o model
      messages: messages,
      temperature: 1,
      max_tokens: 300,
    };

    try {
      // Send the POST request to the Cloudflare Worker
      const response = await fetch(workerURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Check if the response is OK (status 200-299)
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      // Parse the JSON response
      const data = await response.json();

      // Get the chatbot's reply from the response
      const botReply =
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
          ? data.choices[0].message.content
          : "Sorry, I couldn't get a response from the API.";

      // Add the bot's reply to the conversation history
      messages.push({ role: "assistant", content: botReply });

      // Display the updated chat history
      renderChat();
    } catch (error) {
      // Show an error message in the chat if something goes wrong
      messages.push({
        role: "assistant",
        content: "Oops! Something went wrong. Please try again.",
      });
      renderChat();
    }
  }
});
