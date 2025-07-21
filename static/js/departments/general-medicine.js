function increment(id) {
    const span = document.getElementById(id);
    let count = parseInt(span.innerText);
    span.innerText = count + 1;

    const waitTimeInSeconds = Math.floor(count * 7.5 * 60);

    const buttons = document.querySelectorAll(".wait-btn");

    buttons.forEach((btn) => {
      btn.disabled = true;
      btn.style.cursor = "not-allowed";

      if (btn === event.target) {
        btn.innerText = "Booked";
        btn.style.backgroundColor = "#d63031";

        // Add or update estimated wait time display
        const parent = btn.parentElement;
        let existing = parent.querySelector(".wait-time");
        if (existing) existing.remove();

        const waitInfo = document.createElement("p");
        waitInfo.className = "wait-time";
        waitInfo.style.marginTop = "0.5rem";
        waitInfo.style.fontWeight = "bold";
        waitInfo.style.color = "#2e86de";
        parent.appendChild(waitInfo);

        startCountdown(waitTimeInSeconds, waitInfo, btn);
      } else {
        btn.innerText = "Locked";
        btn.style.backgroundColor = "#b2bec3";
      }
    });
  }

  function startCountdown(seconds, displayElement, buttonElement) {
    const timer = setInterval(() => {
      let mins = Math.floor(seconds / 60);
      let secs = seconds % 60;

      displayElement.innerText = `Estimated Wait Time: ${mins} min ${secs < 10 ? "0" + secs : secs} sec`;

      if (seconds <= 0) {
        clearInterval(timer);
        buttonElement.innerText = "Check for your turn";
        buttonElement.style.backgroundColor = "#2ecc71"; 
      }

      seconds--;
    }, 1000);
  }