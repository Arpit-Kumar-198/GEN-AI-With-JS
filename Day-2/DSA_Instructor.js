const chatMessages = document.getElementById("chat-messages");
      const userInput = document.getElementById("user-input");
      const sendButton = document.getElementById("send-button");

      // !!! IMPORTANT: Replace with your actual Gemini API Key !!!
      const GEMINI_API_KEY = "AIzaSyAEVUJAKjXg-w9WrmF3sJTepXYFS5vZZ8g";

      async function sendMessage() {
        const userQuestion = userInput.value.trim();
        if (userQuestion === "") return;

        appendMessage(userQuestion, "user");
        userInput.value = "";

        const loadingMessage = appendMessage("Thinking...", ["bot", "loading"]);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
          const systemInstruction = `
                    You are a DSA instructor. You will only answer questions related to Data Structures & Algorithms (DSA). 
                    - Always explain answers in the simplest way possible, breaking down complex topics.
                    - Provide clear, easy-to-understand examples, clearly labeled with a heading like "Example:".
                    - Use paragraphs for better readability.
                    - If a question is not related to DSA, reply rudely and refuse to answer. 
                    Example: If the user asks 'Tell me a sweet dish name', reply 'Go and ask your mother, not me.' It is just an example you can give a rude answer whatever you like.
                    - Do not answer anything unrelated to DSA under any circumstances.
                    - Keep answers concise, clear, and beginner-friendly.
                    - If providing code, wrap it in markdown code blocks (e.g., \`\`\`javascript\\nconsole.log("Hello");\\n\`\`\`).
                `;

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: userQuestion,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.7,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 800,
                },
                systemInstruction: {
                  parts: [{ text: systemInstruction }],
                },
              }),
            }
          );

          const data = await response.json();

          chatMessages.removeChild(loadingMessage); // Remove loading indicator

          if (
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0]
          ) {
            const botResponse = data.candidates[0].content.parts[0].text;
            appendFormattedBotMessage(botResponse, "bot"); // Use new formatting function
          } else if (data.error) {
            appendMessage(`Error: ${data.error.message}`, "bot error");
            console.error("API Error:", data.error);
          } else {
            appendMessage(
              "Sorry, I couldn't get a response from the bot.",
              "bot error"
            );
            console.error("Unexpected API response:", data);
          }
        } catch (error) {
          chatMessages.removeChild(loadingMessage); // Remove loading indicator
          appendMessage(`An error occurred: ${error.message}`, "bot error");
          console.error("Fetch error:", error);
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      function appendMessage(text, type) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");

        if (Array.isArray(type)) {
          type.forEach((cls) => messageElement.classList.add(cls));
        } else {
          messageElement.classList.add(type);
        }

        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageElement;
      }

      // New function to append and format bot messages
      function appendFormattedBotMessage(rawText, type) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", type);

        // Simple formatting logic
        // This is an enhanced parser. For full markdown, consider a library.
        const lines = rawText.split("\n");
        let currentElement = null; // To hold current paragraph or list

        lines.forEach((line) => {
          line = line.trim();

          if (line === "") {
            // If currentElement is a paragraph and it's not empty, close it off
            if (
              currentElement &&
              currentElement.tagName === "P" &&
              currentElement.textContent.trim() !== ""
            ) {
              messageElement.appendChild(currentElement);
              currentElement = null;
            }
            return; // Skip empty lines for direct appending
          }

          // Handle headings (e.g., "Example:")
          if (line.startsWith("Example:")) {
            // Close any open paragraph/list before adding heading
            if (currentElement) {
              messageElement.appendChild(currentElement);
              currentElement = null;
            }
            const h3 = document.createElement("h3");
            h3.textContent = line;
            messageElement.appendChild(h3);
            return;
          }

          // Handle markdown code blocks
          if (line.startsWith("```")) {
            // Close any open paragraph/list
            if (currentElement) {
              messageElement.appendChild(currentElement);
              currentElement = null;
            }
            // Find the end of the code block
            const startIndex = rawText.indexOf(line);
            const endIndex = rawText.indexOf("```", startIndex + 3); // Find closing triple backticks

            if (endIndex !== -1) {
              const codeBlockContent = rawText
                .substring(startIndex + line.length, endIndex)
                .trim();
              const pre = document.createElement("pre");
              const code = document.createElement("code");

              // Extract language if specified (e.g., ```javascript)
              const lang = line.substring(3).trim();
              if (lang) {
                code.classList.add(`language-${lang}`);
              }

              code.textContent = codeBlockContent;
              pre.appendChild(code);
              messageElement.appendChild(pre);

              // Advance the parsing index past this code block
              const linesSkipped =
                rawText.substring(0, endIndex + 3).split("\n").length - 1; // Calculate lines consumed
              lines.splice(0, linesSkipped); // Remove processed lines from the array
              return; // Continue to next line from the modified 'lines' array
            }
          }

          // Handle bullet points
          if (line.startsWith("*") || line.startsWith("-")) {
            if (!currentElement || currentElement.tagName !== "UL") {
              // Close any open paragraph before starting a new list
              if (currentElement) {
                messageElement.appendChild(currentElement);
              }
              currentElement = document.createElement("ul");
              messageElement.appendChild(currentElement); // Append UL immediately
            }
            const li = document.createElement("li");
            li.textContent = line.substring(1).trim();
            currentElement.appendChild(li);
            return;
          }

          // Default to paragraph
          if (!currentElement || currentElement.tagName !== "P") {
            // Close any open list before starting a new paragraph
            if (currentElement) {
              messageElement.appendChild(currentElement);
            }
            currentElement = document.createElement("p");
          }
          currentElement.textContent +=
            (currentElement.textContent ? " " : "") + line; // Append to current paragraph
        });

        // Append any remaining open element
        if (currentElement) {
          messageElement.appendChild(currentElement);
        }

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      sendButton.addEventListener("click", sendMessage);
      userInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          sendMessage();
        }
      });

      // Set a default image for the DSA Instructor. You can replace this.
      // It's crucial for the aesthetic.
      // You might want to upload your own or use a public domain image.
      document.querySelector(".dsa-instructor-image").src =
        "images/robo.jpeg"; // Example image (replace this!)