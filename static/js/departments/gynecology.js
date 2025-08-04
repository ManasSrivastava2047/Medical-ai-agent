// Gynecology Department JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Initialize AI chat
  initializeAIChat()
})

// AI Chat Functionality
function initializeAIChat() {
  const userInput = document.getElementById("user-input")
  const sendButton = document.getElementById("send-button")
  const chatMessages = document.getElementById("chat-messages")

  function addMessage(sender, message) {
    const messageDiv = document.createElement("div")
    messageDiv.classList.add("message", `${sender}-message`)
    messageDiv.textContent = message
    chatMessages.appendChild(messageDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  async function sendMessage() {
    const message = userInput.value.trim()
    if (!message) return

    addMessage("user", message)
    userInput.value = ""

    // Add typing indicator
    const typingIndicator = document.createElement("div")
    typingIndicator.classList.add("message", "ai-message")
    typingIndicator.innerHTML =
      '<i class="fas fa-circle"></i> <i class="fas fa-circle"></i> <i class="fas fa-circle"></i> AI is analyzing...'
    typingIndicator.style.fontStyle = "italic"
    typingIndicator.style.opacity = "0.7"
    chatMessages.appendChild(typingIndicator)
    chatMessages.scrollTop = chatMessages.scrollHeight

    try {
      const response = await fetch("/api/chat/gynecology", {
        // Changed endpoint to gynecology
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      chatMessages.removeChild(typingIndicator)
      addMessage("ai", data.response)
    } catch (error) {
      console.error("Error:", error)
      chatMessages.removeChild(typingIndicator)
      addMessage(
        "ai",
        "I apologize, but I'm currently unable to respond. For any medical concerns, please consult a healthcare professional directly.",
      )
    }
  }

  sendButton.addEventListener("click", sendMessage)
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage()
    }
  })
}
