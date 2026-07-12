<div id="top"></div>
<br />
<div align="center">
  <a href="https://jiataihan.dev/passport-photo-maker/">
    <img src="public/logo512.png" alt="Logo" width="128" height="128">
  </a>

<h3 align="center">Passport & Visa Photo Maker</h3>

  <p align="center">
    No image editing knowledge and no software download required. Just a few taps on your phone's browser, or a few clicks on your computer, and you can easily remove the background and generate passport or visa photos that meet the standards of different countries.
    <br />
    <a href="https://jiataihan.dev/passport-photo-maker/"><strong>{ Click here to get started }</strong></a>
    <br />
    <a href="https://www.youtube.com/watch?v=z6podleci5E"><strong>{ Click here to watch the video tutorial }</strong></a>
    <br />
  </p>

</div>


<!-- ABOUT THE PROJECT -->
## Features

* Web-based, responsive interface that works across platforms and devices (fully supports mobile browsers)
* Multiple countries' visa and passport photo templates and reference information, defined in JSON, so new ones can be added quickly
* AI-powered automatic background removal (not supported on iPad or iPhone/iOS devices)
* Directly manipulate the image area with mouse or touch, or fine-tune with dedicated controls
* Pan, zoom, and rotate the image with mouse or multi-touch, with additional fine-tuning buttons and a live preview
* High quality output, with configurable output dimensions and file size (upper limit)
* Generate a single photo for electronic upload, or a standard 4"x6" print layout

<p align="right">(<a href="#top">back to top</a>)</p>

* Main interface, Chinese passport/visa photo template
<div align="center">
    <img src="readme_assets/Preview.png" alt="App interface preview" width="600"">
</div>

* AI background removal
<div align="center">
    <img src="readme_assets/Preview_AI_removal.png" alt="App interface preview" width="600"">
</div>

* Generate a single photo or a 4"x6" print layout
<div align="center">
    <img src="readme_assets/Preview_print_layout.png" alt="App interface preview" width="600"">
</div>

* US passport/visa photo template
<div align="center">
    <img src="readme_assets/Preview_US_Chinese.png" alt="App interface preview" width="600"">
</div>

## Introduction

This is a software tool designed specifically for creating photos that meet the passport and visa requirements of various countries. It is user-friendly, simple, and efficient, quickly generating standard photos that comply with the latest guidelines from embassies and consulates. The tool offers a variety of ways to adjust the photo, with an intuitive interface that's easy to use even for people without a technical background, providing users with a convenient way to produce standard-compliant photos from home.

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

* React
* JavaScript
* Node.js
* @imgly/background-removal for AI background removal
* @picocss/pico for the UI framework
* pica@9.0.1 for high quality photo resizing
* react-avatar-editor for the image editor
* react-draggable@4.4.6 for the draggable guide lines

<p align="right">(<a href="#top">back to top</a>)</p>

### Known Issues

* <del>Dragging the pan box could go beyond the canvas boundary</del> (fixed: 2024-01-25)
* <del>Image size was based on the canvas's actual on-screen size, so if a Chinese passport photo is 330x480px, resizing at export time was just interpolated stretching, causing noticeable quality loss. There are two ways to fix this: 1) make the canvas itself larger and scale it down proportionally for display, then export at the original canvas size; 2) reload the original image at export time and use the recorded zoom/pan coordinates to render the output from the original image. Since passport/visa photos generally require a small file size, option 1 is currently more reliable.</del> (fixed: 2024-01-26)
* <del>Panning didn't work correctly until dragging a few times at the start, because the offset coordinates weren't initialized correctly on first zoom; will be fixed when possible</del> (fixed: 2024-01-27)
* <del>After switching templates, the preview image didn't match the canvas area until dragging to refresh it</del> (fixed: 2024-01-28)
* On iOS, saved images aren't placed in the Camera Roll but are instead saved automatically to Files, with no prompt; this may need additional handling for iOS's save-file behavior.

<p align="right">(<a href="#top">back to top</a>)</p>



### Planned Features
* (Feel free to leave suggestions in the Discussions section, or open a new branch to add new features).

<p align="right">(<a href="#top">back to top</a>)</p>

<div>
