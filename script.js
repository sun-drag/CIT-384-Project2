"use strict";

// The starter's pet object holds the three required game values. Weight is in grams.
const pet_info = { name: "Kiwi", weight: 120, happiness: 68 };

// One table describes how each button changes the pet and how long its pose lasts.
const actions = {
  treat: {
    weight: 12, happiness: 14, duration: 2050,
    message: "Crunch! A cracker is my favorite treat.",
    description: "Kiwi is taking a bite of a cracker"
  },
  play: {
    weight: -6, happiness: 18, duration: 2400,
    message: "Look! I can spin the ball with my foot.",
    description: "Kiwi is holding and spinning a toy ball with one foot"
  },
  exercise: {
    weight: -10, happiness: 8, duration: 2600,
    message: "Time for a lap! Stretching my wings makes me happy.",
    finishMessage: "What a flight! I feel better now that I’m back on my perch.",
    description: "Kiwi is flying with both wings spread"
  },
  rest: {
    weight: 0, happiness: 10, duration: 2200,
    message: "A quiet nap right here sounds lovely. Zzz…",
    description: "Kiwi is napping with closed eyes on the perch"
  }
};

// Check the thresholds in order, from happiest to saddest.
const moods = [
  { minimum: 75, name: "Happy", cssName: "happy" },
  { minimum: 35, name: "Curious", cssName: "curious" },
  { minimum: 0, name: "Sad", cssName: "sad" }
];

$(function () {
  const scene = document.querySelector(".pet-image-container");
  const parrotTitle = document.querySelector("#parrot-title");
  const meter = document.querySelector("#happiness-meter");
  const message = $("#pet-message");

  // New jQuery method 1: .find() searches descendants of the action group only.
  // This binds the game handler to its four buttons and excludes any other controls.
  // https://api.jquery.com/find/
  const actionButtons = $(".button-container").find("button[data-action]");

  // Between interactions, lose 12 happiness points per minute in small steps.
  const happinessLossPerMillisecond = 12 / 60000;
  let lastDrainTime = performance.now();
  let activeAction = null;

  function getMood() {
    for (const mood of moods) {
      if (pet_info.happiness >= mood.minimum) {
        return mood;
      }
    }
  }

  function checkAndUpdatePetInfoInHtml() {
    // Put both values back in range before updating the dashboard or the bird.
    pet_info.weight = Math.max(0, pet_info.weight);
    pet_info.happiness = Math.max(0, Math.min(100, pet_info.happiness));

    const mood = getMood();
    $(".name").text(pet_info.name);
    $(".weight").text(pet_info.weight);
    const displayedHappiness = Math.ceil(pet_info.happiness);
    $("#happiness-value").text(displayedHappiness);
    $("#pet-mood").text(activeAction === "rest" ? "Napping" : mood.name);
    meter.value = pet_info.happiness;
    meter.textContent = displayedHappiness + " out of 100";
    meter.setAttribute("aria-valuetext", displayedHappiness + " out of 100");
    meter.dataset.mood = mood.cssName;
    scene.dataset.mood = mood.cssName;

    // Show weight changes in the torso without stretching the head or perch.
    const bellyChange = Math.max(-0.18, Math.min(0.30, (pet_info.weight - 120) / 175));
    scene.style.setProperty("--belly-scale", 1 + bellyChange);
    parrotTitle.textContent = activeAction
      ? actions[activeAction].description
      : "Kiwi, a " + mood.cssName + " green parrot on a tree branch";
  }

  function applyIdleLoss(now) {
    if (activeAction || now <= lastDrainTime) {
      return;
    }

    // Use elapsed time for gentle decay and catch up after a background tab resumes.
    const elapsedMilliseconds = now - lastDrainTime;
    lastDrainTime = now;

    if (pet_info.happiness > 0) {
      const wasSad = getMood().cssName === "sad";
      const happinessLoss = elapsedMilliseconds * happinessLossPerMillisecond;
      // Retain fractional points while avoiding floating-point drift at whole numbers.
      pet_info.happiness = Number((pet_info.happiness - happinessLoss).toFixed(4));
      checkAndUpdatePetInfoInHtml();
      if (!wasSad && getMood().cssName === "sad") {
        message.text("I miss you. Can we spend a little time together?");
      }
    }
  }

  function playAction(event) {
    // New jQuery method 2: .data("action") reads the clicked button's data-action.
    // Its value selects a matching action, letting all four buttons use this handler.
    // https://api.jquery.com/data/
    const actionName = $(event.currentTarget).data("action");
    const action = actions[actionName];

    // Wait for the current animation so repeated clicks do not overlap actions.
    if (activeAction || !action) {
      return;
    }

    const now = performance.now();
    applyIdleLoss(now);
    activeAction = actionName;
    scene.style.setProperty("--action-duration", action.duration + "ms");
    scene.dataset.action = actionName;
    for (const button of actionButtons) {
      // Keep keyboard focus on the selected action while the animation plays.
      button.setAttribute("aria-disabled", "true");
    }

    pet_info.weight += action.weight;
    pet_info.happiness += action.happiness;
    checkAndUpdatePetInfoInHtml();
    message.text(action.message);

    window.setTimeout(function () {
      // The happiness boost happens on click; landing supplies the closing message.
      if (action.finishMessage) {
        message.text(action.finishMessage);
      }

      // Start counting idle time from the end of the interaction.
      lastDrainTime = performance.now();
      activeAction = null;
      delete scene.dataset.action;
      for (const button of actionButtons) {
        button.removeAttribute("aria-disabled");
      }
      checkAndUpdatePetInfoInHtml();
    }, action.duration);
  }

  checkAndUpdatePetInfoInHtml();
  actionButtons.click(playAction);
  for (const button of actionButtons) {
    button.disabled = false;
  }

  window.setInterval(function () {
    applyIdleLoss(performance.now());
  }, 250);

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      applyIdleLoss(performance.now());
    }
  });
});
