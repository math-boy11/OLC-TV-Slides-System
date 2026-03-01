# OLC TV Slides System
This is the repository for the TV Slides system designed for Oakridge Lutheran Church (OLC).

- [OLC TV Slides System](#olc-tv-slides-system)
  - [How it works](#how-it-works)
  - [API](#api)
  - [Customization](#customization)
  - [Running the app](#running-the-app)

## How it works
This program is designed to overlay custom elements on top of an existing slideshow. It works by using an external API to fetch the slides and convert them into a format this program can work with. This keeps things seperate from any internal resources, so you can build your own API and use whatever content management system you want. This program takes the individual slides from the API and displays them in a loop. Then you can add your own custom elements (currently only images and embeds are supported) to any of the slides, allowing you to use elements that aren't nativley supported by your content management system (such as HTML embeds) or elements that won't be converted properly (such as videos, GIFs, or any moving object). The code is designed to make it super simple to implement as many custom elements as you want, and you can add new types of custom elements really easilly.

## API
This program gets the slides data with an HTTP GET request to the configured API endpoint. The response must be JSON in the following format:

```
{
    "width": number,
    "height": number,
    "slides": string[]
}
```

The ```width``` and ```height``` fields are the dimensions of the slides in pixels, and are used for scaling the slides and their custom elements. The ```slides``` field is an array of image URL strings for the slides. SVGs are recommended since they can scale without quality loss, but any standard raster image format (PNG, JPEG, etc.) is also supported.

## Customization
This program is designed to be very customizable. All configuration options are at the top of the ```main.js``` file. To add custom elements, you can customize the ```overlays``` array in this format: 

```
[
    {
        slideIndex: number,
        type: string,
        ---TYPE SPECIFIC FIELDS---
        x: number,
        y: number,
        width: number,
        height: number
    }
]
```

The ```slideIndex``` field (starting from 0) is the slide you want to add overlay to. You can add multiple custom elements to the same slide. The ```type``` field is the type of the custom element. The ```x```, ```y```, ```width``` and ```height``` fields are coordinates scaled to the slides. Here is an example of adding an image and embed overlay to slide #1:

```
[
    {
        "slideIndex": 0,
        "type": "image",
        "url": "IMAGE_URL", 
        "x": 100,
        "y": 100,
        "width": 200,
        "height": 200
    },
    {
        "slideIndex": 0,
        "type": "embed",
        "url": "EMBED_URL", 
        "x": 250,
        "y": 100,
        "width": 200,
        "height": 200
    }
]
```

## Running the app
This program is just a static HTML website. Just clone the repo and open the ```index.html``` file in a web browser. It will grab the data from the API, and when it's finished loading it will immediatly start cycling through the individual slides with the set time delay. You can deploy it to many cloud services that are free such as [GitHub Pages](https://pages.github.com/). The main deployment on GitHub Pages can be accesed [here](https://math-boy11.github.io/olc-tv-slides-system/).
