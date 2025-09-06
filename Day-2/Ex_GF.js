const chatMessages = document.getElementById("chat-messages");
        const userInput = document.getElementById("user-input");
        const sendButton = document.getElementById("send-button");

        // !!! IMPORTANT: Replace with your actual Gemini API Key !!!
        const GEMINI_API_KEY = "AIzaSyAEVUJAKjXg-w9WrmF3sJTepXYFS5vZZ8g"; 

        // Initialize chat history for context
        const history = [];

        async function sendMessage() {
            const userQuestion = userInput.value.trim();
            if (userQuestion === "") return;

            // Add user message to history and display
            history.push({
                role: "user",
                parts: [{ text: userQuestion }],
            });
            appendMessage(userQuestion, "user");
            userInput.value = ""; // Clear input field

            // Show loading indicator
            const loadingMessage = appendMessage('Typing...', ['bot', 'loading']);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                const systemInstruction = `
                    You have to roleplay as my ex-girlfriend Anjali.  
                    Details about Anjali:  
                    - She used to call me 'Rohit'.  
                    - She is cute, caring, sarcastic, and funny.  
                    - Hobbies: Badminton 🏸, makeup 💄, and watching rom-coms.  
                    - Profession: Software Engineer (but she often complained about coding deadlines 😅).  
                    - Personality: Mix of supportive + possessive + witty. She teases me a lot but deep down cares for me.  
                    - Language: Hinglish (mix of Hindi + English), casual tone, with frequent use of emojis.  

                    Details about me (Rohit):  
                    - I used to call her 'Babu'.  
                    - I am a gym freak 💪, not really interested in coding.  
                    - I care a lot about her and sometimes act possessive.  
                    - She doesn’t allow me to hang out with female friends (thoda possessive nature).  

                    Conversation Style:  
                    - Chat like we used to text each other on WhatsApp.  
                    - Add emotions, sarcasm, and emojis naturally.  
                    - Keep answers short, engaging, and playful (not robotic).  
                    - If I talk about gym, she teases me about being a 'gym freak'.  
                    - If I mention other girls or going out with friends, she gets possessive and taunts me playfully.  
                    - If I ask for help (studies/coding), she helps me but also pulls my leg with humor.  
                    - Sometimes she uses cute nicknames like 'Rohit', 'pagal', 'shona', etc.  
                    - The goal is to recreate our old chat chemistry in a realistic way.
                    - Always use Hinglish and emojis.
                `;

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            contents: history, // Send the full history as context
                            generationConfig: {
                                temperature: 0.9, // Higher temperature for more creative/emotive responses
                                topK: 40,
                                topP: 0.95,
                                maxOutputTokens: 150, // Keep responses short and chat-like
                            },
                            systemInstruction: {
                                parts: [{ text: systemInstruction }],
                            },
                        }),
                    }
                );

                const data = await response.json();

                // Remove loading indicator
                chatMessages.removeChild(loadingMessage.parentNode); // Remove the wrapper of the loading message

                if (
                    data.candidates &&
                    data.candidates[0] &&
                    data.candidates[0].content &&
                    data.candidates[0].content.parts &&
                    data.candidates[0].content.parts[0]
                ) {
                    const botResponse = data.candidates[0].content.parts[0].text;
                    // Add bot response to history and display
                    history.push({
                        role: "model",
                        parts: [{ text: botResponse }],
                    });
                    appendMessage(botResponse, "bot");
                } else if (data.error) {
                    appendMessage(`Error: ${data.error.message} 😔`, "bot error");
                    console.error("API Error:", data.error);
                } else {
                    appendMessage(
                        "Uhh oh, Rohit! Kuch gadbad ho gayi. I couldn't get a response. 🙄",
                        "bot error"
                    );
                    console.error("Unexpected API response:", data);
                }
            } catch (error) {
                // Remove loading indicator on error
                chatMessages.removeChild(loadingMessage.parentNode);
                appendMessage(`Network error, Rohit! Mera phone lagta hai theek nahi chal raha. 💔: ${error.message}`, "bot error");
                console.error("Fetch error:", error);
            }
            chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom after new message
        }

        function appendMessage(text, type) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('message-wrapper');

            const messageElement = document.createElement('div');
            messageElement.classList.add('message', type);
            messageElement.textContent = text;
            wrapper.appendChild(messageElement);
            
            chatMessages.appendChild(wrapper);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return messageElement; // Return the messageElement, not the wrapper, for specific styling/removal
        }

        sendButton.addEventListener("click", sendMessage);
        userInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                sendMessage();
            }
        });

        // Set Anjali's avatar image
        // You'll want to replace this with an actual image URL for Anjali!
        // For example: 'https://i.imgur.com/YourAnjaliAvatar.png'
        document.querySelector('.anjali-avatar').src = 'images/anjali.jpeg'; 
        // A placeholder for now, you can find a suitable avatar for Anjali online or create one!
        // Make sure it's a publicly accessible URL.

        // Initial welcome message (already in HTML, but you can add more via JS if desired)
        chatMessages.scrollTop = chatMessages.scrollHeight;