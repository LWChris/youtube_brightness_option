/*
Copyright 2023, LWChris

This script is distributed under CC BY-SA 4.0.

This script uses the following third-party resources:
  * iconmonstr "Brightness 3" (https://iconmonstr.com/brightness-5-svg/)
      Distributed under iconmonstr custom license
      https://iconmonstr.com/license/
*/

// ==UserScript==
// @name            YouTube Brightness Option
// @description     Control YouTube video brightness from the settings menu
// @name:de         YouTube Helligkeitsoption
// @description:de  Steuere die Helligkeit eines YouTube-Videos aus dem Einstellungsmenü
// @icon            https://raw.githubusercontent.com/lwchris/youtube_brightness_option/master/icon.png
// @namespace       LWChris
// @author          LWChris
// @match           https://www.youtube.com/watch?*
// @version         1.0
// ==/UserScript==

(function() {
  'use strict';
  
  // L10N RESOURCES
  const LANGUAGE_DEFAULT = "en-US";

  const LANGUAGE_RESOURCES = {
    [LANGUAGE_DEFAULT]: {
      "brightness": "Brightness"
    },
    "de-DE": {
      "brightness": "Helligkeit"
    }
  };

  // STATE VARIABLES
  var resources, brightness, moviePlayer, video, settingsMenu, speedOption, brightnessOption, text;

  const _init = function() {
    const lang = document.documentElement.lang;
    resources = LANGUAGE_RESOURCES[lang] || LANGUAGE_RESOURCES[LANGUAGE_DEFAULT]
    moviePlayer = document.querySelector("#movie_player");
    if (!moviePlayer) return;
    moviePlayer.style.backgroundColor = "black";
    video = document.querySelector("video");
    settingsMenu = document.querySelector("div.ytp-settings-menu");
    brightness = parseInt(localStorage.getItem("lwchris.youtube_brightness_option.brightness") || "100");
    setBrightness(brightness);
    addObserver();
  };

  const addObserver = function() {

    const config = {
      attributes: false, childList: true, subtree: true
    };

    const observer = new MutationObserver(menuPopulated);
    observer.observe(settingsMenu, config);
  };

  const injectMenuOption = function() {
    if (brightnessOption || !speedOption) {
      return;
    }

    // Use playback speed element as template element
    brightnessOption = speedOption.cloneNode(true);

    // Adjust contents
    const label = brightnessOption.querySelector(".ytp-menuitem-label");
    label.textContent = resources["brightness"];

    // Attribution optional, but credit where credit is due:
    // https://iconmonstr.com/brightness-5-svg/
    const path = brightnessOption.querySelector("path");
    path.setAttribute("d", "\
M12 9c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.34\
6-3 3-3zm0-2c-2.762 0-5 2.238-5 5s2.238 5 5 5 5-2.238 5\
-5-2.238-5-5-5zm0-2c.34 0 .672.033 1 .08v-2.08h-2v2.08c\
.328-.047.66-.08 1-.08zm-4.184 1.401l-1.472-1.473-1.414\
 1.415 1.473 1.473c.401-.537.876-1.013 1.413-1.415zm9.7\
82 1.414l1.473-1.473-1.414-1.414-1.473 1.473c.537.402 1\
.012.878 1.414 1.414zm-5.598 11.185c-.34 0-.672-.033-1-\
.08v2.08h2v-2.08c-.328.047-.66.08-1 .08zm4.185-1.402l1.\
473 1.473 1.415-1.415-1.473-1.472c-.403.536-.879 1.012-\
1.415 1.414zm-11.185-5.598c0-.34.033-.672.08-1h-2.08v2h\
2.08c-.047-.328-.08-.66-.08-1zm13.92-1c.047.328.08.66.0\
8 1s-.033.672-.08 1h2.08v-2h-2.08zm-12.519 5.184l-1.473\
 1.473 1.414 1.414 1.473-1.473c-.536-.402-1.012-.877-1.\
414-1.414z");

    text = brightnessOption.querySelector(".ytp-menuitem-content");
    text.textContent = brightness + "%";

    // Adjust behavior
    brightnessOption.setAttribute("aria-haspopup", "false");
    brightnessOption.addEventListener("click", optionClicked);

    speedOption.parentNode.insertBefore(brightnessOption, speedOption);

    // Adjust height to prevent a scrollbar in the popup
    const isBigPlayer = moviePlayer.classList.contains("ytp-big-mode");
    const panel = settingsMenu.querySelector(".ytp-panel");
    const panelMenu = settingsMenu.querySelector(".ytp-panel-menu");

    const newHeight = "calc(" + panel.style.height + " + " + (isBigPlayer ? 49 : 40) + "px)";
    settingsMenu.style.height = newHeight;
    panel.style.height = newHeight;
    panelMenu.style.height = newHeight;
  };

  const optionClicked = function() {
    brightness += 20;
    if (brightness > 100) {
      brightness = 20;
    }
    setBrightness(brightness);
  };

  const setBrightness = function(b) {
    video.style.opacity = (b / 100);
    if (text) {
      text.textContent = b + "%";
    }
    try {
      if (b === 100) {
        localStorage.removeItem("lwchris.youtube_brightness_option.brightness");
      } else {
        // Try to persist the value for reloads
        localStorage.setItem("lwchris.youtube_brightness_option.brightness", b);
      }
    } catch {
      // Might happen when local storage is disabled for youtube.com
      console.log("Persisting brightness failed");
    }
  }

  const menuPopulated = function(_, observer) {
    const menuItems = settingsMenu.querySelectorAll(".ytp-menuitem");
    speedOption = null;
    for (const item of menuItems) {
      const icon = item.querySelector("path");
      if (icon && icon.getAttribute("d").startsWith("M10,8v8l6-4L10,8L10,8z")) {
        speedOption = item;
        break;
      }
    }
    
    if (speedOption) {
      injectMenuOption();
      observer.disconnect();
    }
  };

  _init();
})();