const slide = $("#slide");
const overlayContainer = $("#overlay-container");
const slideChangeIntervalDuration = 10000;
let slideChangeInterval = null;
let currentSlideIndex = 0;
let slidesData = null;
let calendarData = null;
let scale = null;
const enableAutoRefresh = false;
const customOverlays = {};

// Get the Google Slides data from the server
$.ajax({
    url: "https://script.google.com/macros/s/AKfycbzGiG4PXzJbdYSFdbK0OyTA6L1CUH-Dyhd6Iw_rlF_B2vAiCBUu5Ip2v43gy4P1aKkC-w/exec",
    type: "POST",
    dataType: "json",
}).done((data) => {
    // Hide the loading text and show the slide container
    $("#loading").css("display", "none");
    $("#slide-container").css("display", "initial");

    // Assign the data as global variables
    slidesData = data.slidesData;
    calendarData = data.calendarData;

    // Adjust the slide dimensions to fill the screen
    resize();
    drawSlide();

    $(window).resize(resize);

    // Interval to change the slide
    slideChangeInterval = setInterval(() => {
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
    // Draw the slide
    slide.attr("src", slidesData.slides[currentSlideIndex]);

    // Draw the overlays
    overlayContainer.html("");

    // If there are any overlays for the current slide, loop through them and draw them
    if (customOverlays[currentSlideIndex] != null) {
        for (const [overlayIndex, overlay] of customOverlays[currentSlideIndex].entries()) {
            let overlayElement = null;
            let calendar = null;

            // Initial setup of the overlay elements
            if (overlay.type === "image") {
                // Draw an image overlay (useful for images that can't be exported as SVG, like GIFs)
                overlayElement = $("<img>");
                overlayElement.attr("src", overlay.url);
            } else if (overlay.type === "embed") {
                // Draw an HTML embed
                overlayElement = $("<iframe frameborder='0'></iframe>");
                overlayElement.attr("src", overlay.url);
            } else if (overlay.type === "calendar") {
                // Draw a calendar
                overlayElement = $("<div>");
                calendar = createCalendar(overlayElement[0], calendarData[overlay.calendar], overlay.eventColor);
            }
            
            overlayElement.width(overlay.width * scale);
            overlayElement.height(overlay.height * scale);
            overlayElement.css("maxWidth", overlay.width * scale);
            overlayElement.css("maxHeight", overlay.height * scale);
            overlayElement.css("position", "absolute");
            overlayElement.css("left", overlay.x * scale);
            overlayElement.css("top", overlay.y * scale);
            overlayElement.attr("data-overlay-number", overlayIndex);

            overlayContainer.append(overlayElement);

            // Additional setup of the overlay elements after they're drawn
            if (overlay.type === "calendar") {
                calendar.render();
            }
        }
    }
}

// Function to resize elements to fit the screen
function resize() {
    // Get the window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate the scale factor based on the window size and aspect ratio
    scale = Math.min(windowWidth / slidesData.width, windowHeight / slidesData.height);

    // Set the slide width and height based on the scale
    slide.width(slidesData.width * scale);
    slide.height(slidesData.height * scale);

    // Resize the overlay elements
    const overlayElements = overlayContainer.children();

    for (const overlayElement of overlayElements) {
        const overlayData = customOverlays[currentSlideIndex][$(overlayElement).attr("data-overlay-number")];

        $(overlayElement).width(overlayData.width * scale);
        $(overlayElement).height(overlayData.height * scale);
        $(overlayElement).css("maxWidth", overlayData.width * scale);
        $(overlayElement).css("maxHeight", overlayData.height * scale);
        $(overlayElement).css("left", overlayData.x * scale);
        $(overlayElement).css("top", overlayData.y * scale);
    }
}

// Auto-Refresh logic
if (enableAutoRefresh === true) {
    const now = new Date();
    const reloadTime = new Date();

    // Set the reload time to 1:00am the next day
    reloadTime.setDate(now.getDate() + 1);
    reloadTime.setHours(1, 0, 0, 0);

    // Calculate the time difference
    const timeToReload = reloadTime - now;

    console.log("Page will reload in " + timeToReload / 1000 + " seconds.");

    // Create the timeout to reload the page
    setTimeout(() => {
        location.reload();
    }, timeToReload);
}
