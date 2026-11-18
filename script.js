// Strict mode helps catch mistakes, such as assigning to a variable that was never declared.
"use strict";

// The starter's pet stats
const pet_info = { name: "Kiwi", weight: 120, happiness: 68 };

// Each table describes how each button changes the pet stats and how long its animation lasts.
// Each key matches a button's data-action in index.html
const actions = {
  // A treat adds weight and happiness while CSS slides the cracker to the beak.
  treat: {
    weight: 12, happiness: 14, duration: 2050,   // Duration is in milliseconds (1,000 ms = 1 second) = 2.05 secs
    message: "Crunch! A cracker is my favorite treat.",
    description: "Kiwi is taking a bite of a cracker" //  description labels for assistive technology.
  },
  // Playing makes Kiwi lighter and happier while the foot lifts and spins the ball.
  play: {
    weight: -6, happiness: 18, duration: 2400, // Duration = 2.4s
    message: "Look! I can spin the ball with my foot.",
    description: "Kiwi is holding and spinning a toy ball with one foot" //  description labels for assistive technology.
  },
  // Exercise starts the flight and supplies a second message for when Kiwi lands.
  exercise: {
    weight: -10, happiness: 8, duration: 2600, // Duration = 2.6s
    message: "Time for a lap! Stretching my wings makes me happy.",
    finishMessage: "What a flight!",
    description: "Kiwi is flying with both wings spread" //  description labels for assistive technology.
  },
  // Rest adds happiness without changing weight. The scene switches to Kiwi's sleeping pose.
  rest: {
    weight: 0, happiness: 10, duration: 2200, // Duration = 2.2s
    message: "A quiet nap right here sounds lovely. Zzz…",
    description: "Kiwi is napping with closed eyes on the branch" //  description labels for assistive technology.
  }
};

// Check the thresholds in order, from happiest to saddest.
// Each entry has a minimum score, a label for the dashboard, and a value CSS can match.
// The first match wins: 75–100 is Happy, 35 to 75 is Curious, and under 35 is Sad.
const moods = [
  { minimum: 75, name: "Happy", cssName: "happy" },
  { minimum: 35, name: "Curious", cssName: "curious" },
  { minimum: 0, name: "Sad", cssName: "sad" }
];

// $ is jQuery. Passing it a function runs this setup after the page is ready to use.
$(function () {
  // Find the HTML and SVG elements that will change. A dot selects a class, and a # selects an ID.
  // Keep these references so the game can reuse them each time it redraws.
  const scene = document.querySelector(".pet-image-container");
  const parrotTitle = document.querySelector("#parrot-title");
  const meter = document.querySelector("#happiness-meter");
  const message = $("#pet-message");








// jQuery method 1: .find() finds the four  buttons in index.html.
//$(".button-container") finds the section in your HTML that holds the buttons.
// .find("button[data-action]") looks inside that section and picks out the four buttons marked with data-action: 
// Treat, Play, Exercise, and Rest. JavaScript saves those buttons in actionButtons, and actionButtons.click(playAction) 
// connects them to the game. When you click Treat, playAction reads data-action="treat" from that button and runs the cracker animations
  // https://api.jquery.com/find/
  const actionButtons = $(".button-container").find("button[data-action]");

  // Between interactions, Kiwi loses 1 happiness point every second (1,000 milliseconds).
  const happinessLossPerMillisecond = 1 / 1000;
  // performance.now() gives elapsed time in milliseconds. Remember when we last counted idle time.
  // activeAction is null between interactions and holds a name such as "treat" during an animation.
  let lastDrainTime = performance.now();
  let activeAction = null;

  // Walk through the mood list and return the first entry Kiwi's score qualifies for.
  function getMood() {
    for (const mood of moods) {
      if (pet_info.happiness >= mood.minimum) {
        return mood;
      }
    }
  }

  // Copy the current game values to the screen. This runs at startup, when idle time changes the score,
  // and when an action starts or finishes.
  function checkAndUpdatePetInfoInHtml() {
    // Put both values back in range before updating the dashboard or the bird.
    pet_info.weight = Math.max(0, pet_info.weight);
    pet_info.happiness = Math.max(0, Math.min(100, pet_info.happiness));

    // jQuery .text() sets visible text. Round the displayed happiness up and keep the exact score for the meter and mood checks.
    // The ? : expression chooses "Napping" during Rest and the usual mood label at other times.
    const mood = getMood();
    $(".name").text(pet_info.name);
    $(".weight").text(pet_info.weight);
    const displayedHappiness = Math.ceil(pet_info.happiness);
    $("#happiness-value").text(displayedHappiness);
    $("#pet-mood").text(activeAction === "rest" ? "Napping" : mood.name);
    // Update the meter's numeric value and its text for browsers or assistive technology.
    meter.value = pet_info.happiness;
    meter.textContent = displayedHappiness + " out of 100";
    meter.setAttribute("aria-valuetext", displayedHappiness + " out of 100");
    // Setting dataset.mood writes a data-mood attribute. CSS uses it to color the meter and choose Kiwi's expression.
    meter.dataset.mood = mood.cssName;
    scene.dataset.mood = mood.cssName;

    // Show weight changes in the torso without stretching the head or perch.
    // Turn weight relative to 120 g into a width multiplier from 0.82 to 1.30.
    // CSS reads --belly-scale and gradually applies the new width to the belly group.
    const bellyChange = Math.max(-0.18, Math.min(0.30, (pet_info.weight - 120) / 175));
    scene.style.setProperty("--belly-scale", 1 + bellyChange);
    // Update the accessible name to describe the current action or mood.
    parrotTitle.textContent = activeAction
      ? actions[activeAction].description
      : "Kiwi, a " + mood.cssName + " green parrot on a tree branch";
  }

  // Subtract happiness based on the time Kiwi actually spent idle. The early return pauses the drain during an action
  // and skips calls that have no new elapsed time to count.
  function applyIdleLoss(now) {
    if (activeAction || now <= lastDrainTime) {
      return;
    }

    // Use elapsed time for gentle decay and catch up after a background tab resumes.
    const elapsedMilliseconds = now - lastDrainTime;
    lastDrainTime = now;

    // Once the score is zero, skip the update. Otherwise multiply idle milliseconds by the loss per millisecond.
    if (pet_info.happiness > 0) {
      const wasSad = getMood().cssName === "sad";
      const happinessLoss = elapsedMilliseconds * happinessLossPerMillisecond;
      // Retain fractional points while avoiding floating-point drift at whole numbers.
      pet_info.happiness = Number((pet_info.happiness - happinessLoss).toFixed(4));
      checkAndUpdatePetInfoInHtml();
      // Show the message when Kiwi first enters the Sad mood so each timer tick does not repeat it.
      if (!wasSad && getMood().cssName === "sad") {
        message.text("I miss you. Can we spend a little time together?");
      }
    }
  }

  // This is the shared click handler. event.currentTarget is the button even if the player clicks its icon or text.
  function playAction(event) {








 


  
  // New jQuery method 2: .data("action") reads the action name from the clicked button in index.html.
       //If you clicked Treat, .data("action") reads data-action="treat" from that button and saves "treat" in actionName. 
    // On the second line, actions[actionName] becomes actions["treat"], which looks up the Treat settings for Kiwi’s weight, happiness, message, and animation length.
    // Later, scene.dataset.action = actionName puts data-action="treat" on Kiwi’s scene. That’s what makes the matching rule in style.css start the cracker animation. 
    // So the first line gets the action name, and the second line gets the instructions for that action.
    // https://api.jquery.com/data/
    const actionName = $(event.currentTarget).data("action");
    const action = actions[actionName];

    // Wait for the current animation so repeated clicks do not overlap actions.
    if (activeAction || !action) {
      return;
    }

    // Count idle time up to the click before setting activeAction, which pauses further drain.
    const now = performance.now();
    applyIdleLoss(now);
    activeAction = actionName;
    // Pass the duration to CSS as a custom property. Setting dataset.action writes data-action on the scene.
    // For example, data-action="treat" activates the cracker and beak rules in style.css. The browser plays the motion.
    scene.style.setProperty("--action-duration", action.duration + "ms");
    scene.dataset.action = actionName;
    // Mark the buttons as temporarily unavailable for assistive technology. The activeAction check above blocks extra clicks.
    for (const button of actionButtons) {
      // Keep keyboard focus on the selected action while the animation plays.
      button.setAttribute("aria-disabled", "true");
    }

    // Apply the action's weight and happiness changes immediately. += adds the configured number, including a negative weight change.
    pet_info.weight += action.weight;
    pet_info.happiness += action.happiness;
    checkAndUpdatePetInfoInHtml();
    message.text(action.message);

    // Run this callback once after action.duration milliseconds. It cleans up the pose and ends any repeating CSS animations.
    window.setTimeout(function () {
      // The happiness boost happens on click; landing supplies the closing message.
      if (action.finishMessage) {
        message.text(action.finishMessage);
      }

      // Start counting idle time from the end of the interaction.
      lastDrainTime = performance.now();
      activeAction = null;
      // Removing data-action makes the action-specific CSS rules stop matching. Kiwi returns to the current mood pose.
      delete scene.dataset.action;
      // Make the buttons available again and refresh the screen. For Rest, this restores the regular mood label and description.
      for (const button of actionButtons) {
        button.removeAttribute("aria-disabled");
      }
      checkAndUpdatePetInfoInHtml();
    }, action.duration);
  }

  // Draw the starting values and connect each button to the shared handler. The HTML starts the buttons disabled until setup finishes.
  checkAndUpdatePetInfoInHtml();
  actionButtons.click(playAction);
  for (const button of actionButtons) {
    button.disabled = false;
  }

  // Update the bar about four times a second for smooth movement. At 1 point per second,
  // each 250 ms check removes about 0.25 points, based on the time that actually passed.
  window.setInterval(function () {
    applyIdleLoss(performance.now());
  }, 250);

  // If the browser slowed the timer while the tab was hidden, catch up on elapsed idle time when it becomes visible.
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      applyIdleLoss(performance.now());
    }
  });
});
