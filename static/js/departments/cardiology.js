// Merged content from general-medicine.js and general-medicine-chat.js
// (This will be identical for all departments)
function increment(id) {
  const span = document.getElementById(id)
  let count = Number.parseInt(span.innerText)
  count++ // Increment the count
  span.innerText = count // Update the displayed count

  const waitTimeInSeconds = Math.floor(count * 7.5 * 60) // Calculate wait time based on new count

  const buttons = document.querySelectorAll(".wait-btn")

  buttons.forEach((btn) => {
    btn.disabled = true
    btn.style.cursor = "not-allowed"

    // Check if this is the button that was clicked
    if (btn === event.target) {
      btn.innerText = "Booked"
      btn.style.backgroundColor = "var(--color-error)" // Use CSS variable for consistency

      // Add or update estimated wait time display
      const parent = btn.parentElement
      let waitInfo = parent.querySelector(".wait-time")
      if (!waitInfo) {
        waitInfo = document.createElement("p")
        waitInfo.className = "wait-time"
        parent.appendChild(waitInfo)
      }
      startCountdown(waitTimeInSeconds, waitInfo, btn)
    } else {
      btn.innerText = "Locked"
      btn.style.backgroundColor = "var(--color-disabled)" // Use CSS variable
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
      displayElement.innerText = "Your turn is approaching!" // More encouraging message
      buttonElement.innerText = "Check for your turn"
      buttonElement.style.backgroundColor = "var(--color-success)" // Use CSS variable
      buttonElement.disabled = false // Re-enable button for checking
      buttonElement.style.cursor = "pointer"
    }

    seconds--
  }, 1000)
}

// AI Chat Functionality (Modified for Dialog)
function initializeAIChat() {
  const aiChatLauncher = document.getElementById("ai-chat-launcher")
  const aiChatDialog = document.getElementById("ai-chat-dialog")
  const closeChatDialogButton = document.getElementById("close-chat-dialog")
  const dialogHeader = document.getElementById("dialog-header") // For dragging
  const userInput = document.getElementById("user-input")
  const sendButton = document.getElementById("send-button")
  const chatMessages = document.getElementById("chat-messages")

  let isDragging = false
  let offsetX, offsetY

  // Open dialog
  aiChatLauncher.addEventListener("click", () => {
    aiChatDialog.style.display = "flex"
    aiChatLauncher.style.display = "none" // Hide launcher when dialog is open
    chatMessages.scrollTop = chatMessages.scrollHeight // Scroll to bottom on open
  })

  // Close dialog
  closeChatDialogButton.addEventListener("click", () => {
    aiChatDialog.style.display = "none"
    aiChatLauncher.style.display = "flex" // Show launcher when dialog is closed
  })

  // Make dialog draggable
  dialogHeader.addEventListener("mousedown", (e) => {
    isDragging = true
    aiChatDialog.classList.add("dragging")
    offsetX = e.clientX - aiChatDialog.getBoundingClientRect().left
    offsetY = e.clientY - aiChatDialog.getBoundingClientRect().top
    aiChatDialog.style.cursor = "grabbing"
  })

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return

    let newLeft = e.clientX - offsetX
    let newTop = e.clientY - offsetY

    // Boundary checks
    const dialogRect = aiChatDialog.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Prevent dragging outside left/top
    newLeft = Math.max(0, newLeft)
    newTop = Math.max(0, newTop)

    // Prevent dragging outside right/bottom
    newLeft = Math.min(newLeft, viewportWidth - dialogRect.width)
    newTop = Math.min(newTop, viewportHeight - dialogRect.height)

    aiChatDialog.style.left = `${newLeft}px`
    aiChatDialog.style.top = `${newTop}px`
    aiChatDialog.style.right = "auto" // Disable right/bottom positioning when dragging
    aiChatDialog.style.bottom = "auto"
  })

  document.addEventListener("mouseup", () => {
    isDragging = false
    aiChatDialog.classList.remove("dragging")
    aiChatDialog.style.cursor = "grab"
  })

  // Existing chat message logic
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
    userInput.value = "" // Clear input

    // Add a "typing" indicator
    const typingIndicator = document.createElement("div")
    typingIndicator.classList.add("message", "ai-message", "typing-indicator")
    typingIndicator.textContent = "AI is typing..."
    chatMessages.appendChild(typingIndicator)
    chatMessages.scrollTop = chatMessages.scrollHeight

    try {
      // Assuming the Python backend has an endpoint for each department
      const response = await fetch("/api/chat/cardiology", {
        // Adjusted endpoint for cardiology
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
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize AI chat
  initializeAIChat()
  // Initialize Dark Mode
  initializeDarkMode()
  // Initialize FAQ Accordion
  initializeFAQAccordion()
  // The `increment` function is called via `onclick` attributes, so no direct call here.
})

// --- Dark Mode Toggle Functionality ---
function initializeDarkMode() {
  const darkModeToggle = document.getElementById("dark-mode-toggle")

  function enableDarkMode() {
    document.body.setAttribute("data-theme", "dark")
    localStorage.setItem("theme", "dark")
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode'
  }

  function disableDarkMode() {
    document.body.removeAttribute("data-theme")
    localStorage.setItem("theme", "light")
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode'
  }

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "dark") {
    enableDarkMode()
  } else {
    disableDarkMode() // Ensure light mode is default if no preference or 'light'
  }

  darkModeToggle.addEventListener("click", () => {
    if (document.body.getAttribute("data-theme") === "dark") {
      disableDarkMode()
    } else {
      enableDarkMode()
    }
  })
}

// --- FAQ Accordion Functionality ---
function initializeFAQAccordion() {
  const faqQuestions = document.querySelectorAll(".faq-question")

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling
      const isExpanded = question.getAttribute("aria-expanded") === "true"

      // Close all other open answers
      faqQuestions.forEach((otherQuestion) => {
        if (otherQuestion !== question && otherQuestion.getAttribute("aria-expanded") === "true") {
          otherQuestion.setAttribute("aria-expanded", "false")
          otherQuestion.nextElementSibling.style.display = "none"
        }
      })

      // Toggle current answer (FIXED: changed `if (isExpanded)` to `if (!isExpanded)`)
      if (!isExpanded) {
        question.setAttribute("aria-expanded", "true")
        answer.style.display = "block"
      } else {
        question.setAttribute("aria-expanded", "false")
        answer.style.display = "none"
      }
    })
  })
}
