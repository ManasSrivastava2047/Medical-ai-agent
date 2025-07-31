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

// --- AI Chat Functionality ---
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
      // Assuming the Python backend has an endpoint for each department
      const response = await fetch("/api/chat/mental_health", {
        // Adjusted endpoint for mental health
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

  // --- Testimonial Carousel Functionality ---
  const testimonialCarousel = document.querySelector(".testimonial-carousel")
  const testimonialItems = document.querySelectorAll(".testimonial-item")
  const carouselDotsContainer = document.querySelector(".carousel-dots")
  let currentTestimonialIndex = 0

  if (testimonialItems.length > 1) {
    // Create dots
    testimonialItems.forEach((_, index) => {
      const dot = document.createElement("span")
      dot.classList.add("dot")
      if (index === 0) dot.classList.add("active")
      dot.addEventListener("click", () => goToTestimonial(index))
      carouselDotsContainer.appendChild(dot)
    })

    const dots = document.querySelectorAll(".dot")

    function goToTestimonial(index) {
      currentTestimonialIndex = index
      testimonialCarousel.scrollTo({
        left: testimonialItems[currentTestimonialIndex].offsetLeft,
        behavior: "smooth",
      })
      updateDots()
    }

    function updateDots() {
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentTestimonialIndex)
      })
    }

    // Auto-scroll testimonials
    setInterval(() => {
      currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonialItems.length
      goToTestimonial(currentTestimonialIndex)
    }, 7000) // Change every 7 seconds
  }

  // --- Breathing Exercise Functionality ---
  const breathingCircle = document.querySelector(".breathing-circle")
  const breathingInstruction = document.getElementById("breathing-instruction")
  const startBreathingBtn = document.getElementById("start-breathing-btn")
  let breathingIntervalId // Use a distinct name to avoid conflict

  function startBreathingExercise() {
    // If an exercise is already running, clear it first
    if (breathingIntervalId) {
      clearInterval(breathingIntervalId)
      breathingCircle.classList.remove("expand", "contract") // Reset animation
      breathingInstruction.textContent = "Breathe In" // Reset instruction
    }

    startBreathingBtn.textContent = "Exercise Running..."
    startBreathingBtn.style.backgroundColor = "var(--color-secondary)" // Change color to indicate active

    let phase = 0 // 0: Breathe In, 1: Hold, 2: Breathe Out, 3: Hold
    const phases = [
      { text: "Breathe In", duration: 4000, class: "expand" },
      { text: "Hold", duration: 2000, class: "" },
      { text: "Breathe Out", duration: 4000, class: "contract" },
      { text: "Hold", duration: 2000, class: "" },
    ]

    function runBreathingPhase() {
      const currentPhase = phases[phase]
      breathingInstruction.textContent = currentPhase.text

      breathingCircle.classList.remove("expand", "contract") // Clear previous classes
      if (currentPhase.class) {
        breathingCircle.classList.add(currentPhase.class)
      }

      // Set timeout for the next phase
      breathingIntervalId = setTimeout(() => {
        phase = (phase + 1) % phases.length
        runBreathingPhase()
      }, currentPhase.duration)
    }

    // Start the first phase
    runBreathingPhase()
  }

  startBreathingBtn.addEventListener("click", startBreathingExercise)

  // --- FAQ Accordion Functionality ---
  const faqItems = document.querySelectorAll(".faq-item")

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")
    const answer = item.querySelector(".faq-answer")

    question.addEventListener("click", () => {
      // Close other open answers
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.querySelector(".faq-question").classList.remove("active")
          otherItem.querySelector(".faq-answer").classList.remove("open")
        }
      })

      // Toggle current answer
      question.classList.toggle("active")
      answer.classList.toggle("open")
    })
  })

  // --- Direct Inquiry Form Submission (Frontend only) ---
  const inquiryForm = document.getElementById("inquiry-form")
  if (inquiryForm) {
    inquiryForm.addEventListener("submit", (event) => {
      event.preventDefault() // Prevent actual form submission

      const name = document.getElementById("inquiry-name").value
      const email = document.getElementById("inquiry-email").value
      const message = document.getElementById("inquiry-message").value

      console.log("Inquiry Submitted:")
      console.log("Name:", name)
      console.log("Email:", email)
      console.log("Message:", message)

      alert("Thank you for your inquiry! We will get back to you shortly.")

      // Clear the form
      inquiryForm.reset()
    })
  }

  // --- Random Quotes Functionality ---
  const randomQuotes = [
    { text: "The mind is everything. What you think you become.", author: "– Buddha" },
    { text: "You are not alone. We are here to help.", author: "– ApexCare" },
    { text: "Healing takes courage, and we believe in yours.", author: "– Unknown" },
    { text: "Every day is a new opportunity to rebuild.", author: "– Unknown" },
    { text: "Your feelings are valid. Your journey matters.", author: "– Unknown" },
    { text: "Small steps forward are still steps forward.", author: "– Unknown" },
    { text: "Embrace your vulnerability; it's a sign of strength.", author: "– Brené Brown" },
    { text: "The only way out is through.", author: "– Robert Frost" },
  ]

  const quoteContainers = document.querySelectorAll(".random-quote-container")
  const currentQuoteIndices = Array(quoteContainers.length).fill(-1) // Track which quote is in which container

  function getRandomUniqueQuoteIndex(excludeIndices) {
    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * randomQuotes.length)
    } while (excludeIndices.includes(randomIndex))
    return randomIndex
  }

  function updateRandomQuotes() {
    const activeQuoteIndices = Array.from(currentQuoteIndices) // Copy current indices

    quoteContainers.forEach((container, index) => {
      // Fade out current quote
      container.classList.remove("fade-in")

      setTimeout(() => {
        // Get a new unique quote index
        const newQuoteIndex = getRandomUniqueQuoteIndex(activeQuoteIndices)
        activeQuoteIndices[index] = newQuoteIndex // Update active list
        currentQuoteIndices[index] = newQuoteIndex // Update global tracker

        const quote = randomQuotes[newQuoteIndex]
        container.querySelector(".random-quote-text").textContent = quote.text
        container.querySelector(".random-quote-author").textContent = quote.author

        // Fade in new quote
        container.classList.add("fade-in")
      }, 1000) // Match CSS transition duration for fade-out
    })
  }

  // Initial display of random quotes
  quoteContainers.forEach((container, index) => {
    const initialQuoteIndex = getRandomUniqueQuoteIndex(currentQuoteIndices)
    currentQuoteIndices[index] = initialQuoteIndex
    const quote = randomQuotes[initialQuoteIndex]
    container.querySelector(".random-quote-text").textContent = quote.text
    container.querySelector(".random-quote-author").textContent = quote.author
    container.classList.add("fade-in") // Initial fade-in
  })

  // Set interval to update quotes
  setInterval(updateRandomQuotes, 7000) // Change quotes every 7 seconds
})
