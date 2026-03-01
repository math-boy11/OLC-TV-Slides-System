// Config options
const apiEndpoint = "https://script.google.com/macros/s/AKfycbzGiG4PXzJbdYSFdbK0OyTA6L1CUH-Dyhd6Iw_rlF_B2vAiCBUu5Ip2v43gy4P1aKkC-w/exec";
const slideChangeIntervalDuration = 10000;
const enableAutoRefresh = true;
const overlays = [];

// Global variables
const slide = $("#slide");
const overlaysRoot = $("#overlays");
let slideChangeInterval = null;
let currentSlideIndex = 0;
let previousSlideIndex = 0;
let slidesData = null;

// Get the slides data from the server
$.ajax({
    url: apiEndpoint,
    type: "POST",
    dataType: "json",
}).done((data) => {
    // Assign the slides data as a global variable
    slidesData = data;

    // Create all the overlays
    createOverlays();

    // Adjust the dimensions to fill the screen
    resize();
    $(window).resize(resize);

    // Hide the loading text and show the slide container
    $("#loading").css("display", "none");
    $("#slide-container").css("display", "initial");

    // Draw the first slide
    drawSlide();

    // Create the interval to change the slide
    slideChangeInterval = setInterval(() => {
        // Set the previous slide index to the current slide index
        previousSlideIndex = currentSlideIndex;

        // Loop back to the first slide if we are currently on the last slide
        if (slidesData.slides.length - 1 === currentSlideIndex) {
            currentSlideIndex = 0;
        } else {
            currentSlideIndex++;
        }

        drawSlide();
    }, slideChangeIntervalDuration);
});

// Function to draw the current slide onto the DOM
function drawSlide() {
    // Hide the overlays from the previous slide
    if (previousSlideIndex !== currentSlideIndex) {
        $(`.overlays-container[data-slide-index="${previousSlideIndex}"]`).css("display", "none");
    }

    // Draw the slide
    slide.attr("src", slidesData.slides[currentSlideIndex]);

    // Show the overlays for the current slide
    $(`.overlays-container[data-slide-index="${currentSlideIndex}"]`).css("display", "initial");
}

// Function to create the overlays
function createOverlays() {
    // Create a container for each slide's overlays
    for (let slideIndex = 0; slideIndex < slidesData.slides.length; slideIndex++) {
        overlaysRoot.append(`<div class="overlays-container" data-slide-index="${slideIndex}"></div>`);
    }

    // Loop through each of the overlays and add them to their appropriate container
    for (let overlayIndex = 0; overlayIndex < overlays.length; overlayIndex++) {
        const overlay = overlays[overlayIndex];
        let overlayElement = null;

        switch (overlay.type) {
            case "image":
                // Create an image overlay
                overlayElement = $(`<img src="${escapeQuotes(encodeURI(overlay.url))}">`);
                break;
            case "embed":
                // Create an HTML embed overlay
                overlayElement = $(`<iframe src="${escapeQuotes(encodeURI(overlay.url))}" frameborder="0"></iframe>`);
                break;
        }

        // Add the properties for all overlay elements
        overlayElement.addClass("overlay");
        overlayElement.css("position", "absolute");
        overlayElement.attr("data-index", overlayIndex);

        // Add the overlay to the appropriate container
        $(`.overlays-container[data-slide-index="${overlay.slideIndex}"]`).append(overlayElement);
    }
}

// Function to resize the slide to fit the screen
function resize() {
    // Get the window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate the scale factor based on the window size and aspect ratio
    const scale = Math.min(windowWidth / slidesData.width, windowHeight / slidesData.height);

    // Set the slide width and height based on the scale
    slide.width(slidesData.width * scale);
    slide.height(slidesData.height * scale);

    // Resize the overlays
    const overlaysElements = $(".overlay");

    for (const overlayElement of overlaysElements) {
        const overlayData = overlays[$(overlayElement).attr("data-index")];

        $(overlayElement).width(overlayData.width * scale);
        $(overlayElement).height(overlayData.height * scale);
        $(overlayElement).css("maxWidth", overlayData.width * scale);
        $(overlayElement).css("maxHeight", overlayData.height * scale);
        $(overlayElement).css("left", overlayData.x * scale);
        $(overlayElement).css("top", overlayData.y * scale);
    }
}

// Auto-refresh logic
if (enableAutoRefresh === true) {
    const now = new Date();
    const reloadTime = new Date();

    // Set the reload time to 1:00 AM the next day
    reloadTime.setDate(now.getDate() + 1);
    reloadTime.setHours(1, 0, 0, 0);

    // Calculate the time difference
    const timeToReload = reloadTime - now;

    console.log(`Page will reload in ${timeToReload / 1000} seconds.`);

    // Create the timeout to reload the page
    setTimeout(() => {
        location.reload();
    }, timeToReload);
}

// Function to replace quotes with the HTML code equivalent
function escapeQuotes(str) {
    return str.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}
