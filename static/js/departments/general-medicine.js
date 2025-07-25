function increment(id) {
  const span = document.getElementById(id)
  const count = Number.parseInt(span.innerText)
  span.innerText = count + 1

  const waitTimeInSeconds = Math.floor(count * 7.5 * 60)

  const buttons = document.querySelectorAll(".wait-btn")

  buttons.forEach((btn) => {
    btn.disabled = true
    btn.style.cursor = "not-allowed"

    if (btn === event.target) {
      btn.innerText = "Booked"
      btn.style.backgroundColor = "#d63031"

      // Add or update estimated wait time display
      const parent = btn.parentElement
      const existing = parent.querySelector(".wait-time")
      if (existing) existing.remove()

      const waitInfo = document.createElement("p")
      waitInfo.className = "wait-time"
      waitInfo.style.marginTop = "0.5rem"
      waitInfo.style.fontWeight = "bold"
      waitInfo.style.color = "#2e86de"
      parent.appendChild(waitInfo)

      startCountdown(waitTimeInSeconds, waitInfo, btn)
    } else {
      btn.innerText = "Locked"
      btn.style.backgroundColor = "#b2bec3"
    }
  })
}

function startCountdown(seconds, displayElement, buttonElement) {
  const timer = setInterval(() => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60

    displayElement.innerText = `Estimated Wait Time: ${mins} min ${secs < 10 ? "0" + secs : secs} sec`

    if (seconds <= 0) {
      clearInterval(timer)
      buttonElement.innerText = "Check for your turn"
      buttonElement.style.backgroundColor = "#2ecc71"
    }

    seconds--
  }, 1000)
}
document.addEventListener("DOMContentLoaded", () => {
  const userInput = document.getElementById("user-input")
  const sendButton = document.getElementById("send-button")
  const chatMessages = document.getElementById("chat-messages")

  // Function to add a message to the chat display
  function addMessage(sender, message) {
    const messageDiv = document.createElement("div")
    messageDiv.classList.add("message", `${sender}-message`)
    messageDiv.textContent = message
    chatMessages.appendChild(messageDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight // Scroll to bottom
  }

  // Function to send message to AI
  async function sendMessage() {
    const message = userInput.value.trim()
    if (!message) return

    addMessage("user", message)
    userInput.value = "" // Clear input

    // Add a "typing" indicator
    const typingIndicator = document.createElement("div")
    typingIndicator.classList.add("message", "ai-message", "typing-indicator")
    typingIndicator.textContent = "AI is typing..."
    chatMessages.appendChild(typingIndicator)
    chatMessages.scrollTop = chatMessages.scrollHeight

    try {
      const response = await fetch("/api/chat/general-medicine", {
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
      chatMessages.removeChild(typingIndicator) // Remove typing indicator
      addMessage("ai", data.response)
    } catch (error) {
      console.error("Error:", error)
      chatMessages.removeChild(typingIndicator) // Remove typing indicator
      addMessage("ai", "Sorry, I could not get a response. Please try again.")
    }
  }

  sendButton.addEventListener("click", sendMessage)
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage()
    }
  })
})

