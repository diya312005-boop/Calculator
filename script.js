(function () {
  "use strict";

  const display = document.getElementById("display");
  const buttons = document.querySelectorAll(".btn");
  const clickSound = document.getElementById("clickSound");

  let currentValue = "0";
  let previousValue = "";
  let operator = null;
  let shouldResetDisplay = false;

  // --- Ancient mechanical click sound (Web Audio API) ---
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playAncientClick() {
    if (!clickSound) return;
  
    clickSound.pause();
    clickSound.currentTime = 0;
    clickSound.volume = 0.4;
    clickSound.play().catch(console.error);
  }

  function flashButton(btn) {
    if (!btn) return;
    btn.classList.add("pressed");
    setTimeout(() => btn.classList.remove("pressed"), 100);
  }

  function updateDisplay() {
    const text = currentValue.length > 12
      ? parseFloat(currentValue).toExponential(6)
      : currentValue;
    display.textContent = text;
  }

  function inputDigit(digit) {
    if (shouldResetDisplay) {
      currentValue = digit;
      shouldResetDisplay = false;
    } else {
      currentValue = currentValue === "0" ? digit : currentValue + digit;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (shouldResetDisplay) {
      currentValue = "0.";
      shouldResetDisplay = false;
    } else if (!currentValue.includes(".")) {
      currentValue += ".";
    }
    updateDisplay();
  }

  function clearAll() {
    currentValue = "0";
    previousValue = "";
    operator = null;
    shouldResetDisplay = false;
    updateDisplay();
  }

  function backspace() {
    if (shouldResetDisplay) return;
    if (currentValue.length <= 1 || (currentValue.length === 2 && currentValue.startsWith("-"))) {
      currentValue = "0";
    } else {
      currentValue = currentValue.slice(0, -1);
    }
    updateDisplay();
  }

  function toggleSign() {
    if (currentValue === "0") return;
    currentValue = currentValue.startsWith("-")
      ? currentValue.slice(1)
      : "-" + currentValue;
    updateDisplay();
  }

  function percent() {
    currentValue = String(parseFloat(currentValue) / 100);
    updateDisplay();
  }

  function calculate(a, b, op) {
    const x = parseFloat(a);
    const y = parseFloat(b);
    switch (op) {
      case "+": return x + y;
      case "-": return x - y;
      case "*": return x * y;
      case "/": return y === 0 ? "Error" : x / y;
      default: return y;
    }
  }

  function setOperator(op) {
    if (operator && !shouldResetDisplay) {
      const result = calculate(previousValue, currentValue, operator);
      if (result === "Error") {
        currentValue = "Error";
        operator = null;
        previousValue = "";
        shouldResetDisplay = true;
        updateDisplay();
        return;
      }
      currentValue = String(result);
      updateDisplay();
    }
    previousValue = currentValue;
    operator = op;
    shouldResetDisplay = true;
  }

  function equals() {
    if (!operator) return;
    const result = calculate(previousValue, currentValue, operator);
    currentValue = result === "Error" ? "Error" : String(result);
    operator = null;
    previousValue = "";
    shouldResetDisplay = true;
    updateDisplay();
  }

  function handleAction(action, value) {
    if (currentValue === "Error" && action !== "clear") {
      clearAll();
      if (action === "clear") return;
    }

    switch (action) {
      case "digit":
        inputDigit(value);
        break;
      case "decimal":
        inputDecimal();
        break;
      case "operator":
        setOperator(value);
        break;
      case "equals":
        equals();
        break;
      case "clear":
        clearAll();
        break;
      case "toggle-sign":
        toggleSign();
        break;
      case "percent":
        percent();
        break;
    }
  }

  function findButtonForKey(key) {
    const normalized = key === "?" ? "/" : key;
    for (const btn of buttons) {
      const dataKey = btn.dataset.key;
      if (dataKey === normalized || dataKey === key) return btn;
    }
    if (key >= "0" && key <= "9") {
      return document.querySelector(`.btn[data-value="${key}"]`);
    }
    return null;
  }

  function triggerKey(key) {
    const btn = findButtonForKey(key);
    flashButton(btn);
    playAncientClick();

    if (key >= "0" && key <= "9") {
      handleAction("digit", key);
      return;
    }

    switch (key) {
      case ".":
      case ",":
        handleAction("decimal");
        break;
      case "+":
        handleAction("operator", "+");
        break;
      case "-":
        handleAction("operator", "-");
        break;
      case "*":
        handleAction("operator", "*");
        break;
      case "/":
        handleAction("operator", "/");
        break;
      case "Enter":
      case "=":
        handleAction("equals");
        break;
      case "Escape":
      case "c":
      case "C":
        handleAction("clear");
        break;
      case "Backspace":
        backspace();
        break;
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      playAncientClick();
      flashButton(btn);
      handleAction(btn.dataset.action, btn.dataset.value);
    });
  });

  document.addEventListener("keydown", (e) => {
    const key = e.key;

    const handled =
      (key >= "0" && key <= "9") ||
      key === "." ||
      key === "," ||
      key === "+" ||
      key === "-" ||
      key === "*" ||
      key === "/" ||
      key === "Enter" ||
      key === "=" ||
      key === "Escape" ||
      key === "Backspace" ||
      key === "c" ||
      key === "C";

    if (!handled) return;

    e.preventDefault();
    triggerKey(key);
  });

  updateDisplay();
})();
