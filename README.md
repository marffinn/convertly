# Convertly - Image Converter

A simple and intuitive web-based image converter built with React. Convert your images to various formats like PNG, JPEG, WebP, and AVIF with ease.

## Features

-   **Drag and Drop:** Easily upload images by dragging and dropping them into the designated area.
-   **Multiple Formats:** Convert images to PNG, JPEG, WebP, and AVIF.
-   **Batch Conversion:** Convert multiple images at once.
-   **Individual and Batch Download:** Download converted images individually or all at once as a ZIP archive.
-   **Responsive Design:** Works seamlessly across different devices.
-   **Dark Mode:** Enjoy a comfortable viewing experience with the default dark theme.

## Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/marffinn/Convertly.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd Convertly
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

## Usage

1.  **Start the development server:**
    ```bash
    npm start
    ```
    This will open the application in your browser at `http://localhost:3001`.

2.  **Convert Images:**
    *   Drag and drop your image files into the designated area, or click the area to open the file picker.
    *   Select your desired output format (PNG, JPEG, WebP, AVIF).
    *   Click the "Convert" button.
    *   Once converted, you can download individual images or all of them as a ZIP file.

## Deployment

This application is automatically deployed to GitHub Pages using GitHub Actions whenever changes are pushed to the `master` branch.

You can access the live application here: [https://marffinn.github.io/Convertly/](https://marffinn.github.io/Convertly/)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3001](http://localhost:3001) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!