# Image Measurer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-blue)](https://measure.arumi.top)

## Introduction

[Image Measurer](https://measure.arumi.top) is a tool that allows users to take precise measurements on images. It provides tools to draw measurement lines on images and export the data for further analysis. The app is built with SvelteKit and offers an intuitive interface for measuring dimensions in both pixel and real-world units.

## Features

- **Image Upload**: Upload images for measurement directly from your device.
- **Measurement Tools**: Draw, edit, and manage measurement lines on images with precise control.
- **Real-world Units**: Convert pixel measurements to real-world units using a configurable ratio.
- **Grid System**: Overlay a configurable grid on images to assist with measurements.
- **Data Export**: Export measurement data as CSV files.
- **Undo/Redo**: Full undo and redo functionality for all editing operations.
- **Pixel Perfect Mode**: Snap measurements to exact pixel positions.
- **Line Properties**: Control visibility, lock status, and names of measurement lines.
- **Visual Customization**: Customize colors for lines, text, and grid.

## User Guide

### Getting Started

1. **Upload an Image**:

   - Navigate to the main page and click the "Create" button.
   - Drop an image onto the dropzone or click to browse your files.

2. **Basic Navigation**:
   - **Pan the Image**: Hold the middle mouse button and drag to move the image.
   - **Zoom**: Use the mouse wheel to zoom in and out.
   - **Reset View**: Click the square icon in the toolbar to reset the view.

### Creating and Editing Measurements

1. **Draw a Line**:

   - **Default Mode**: Hold left mouse button to place the start point, move to desired end point, and release to complete the line.
   - **Using Snap (Hold Shift)**: Hold Shift while drawing to snap lines to 45-degree increments or to existing points.

2. **Select and Move Points**:

   - Click the pointer icon in the toolbar to enter select mode (or hold Ctrl temporarily).
   - Hover over a line endpoint (marked with crosshairs) until the cursor changes to a grab cursor.
   - Click and drag to move the endpoint.
   - Hold Shift while moving an endpoint to snap to 45-degree increments or to existing points.

3. **Line Properties**:
   - **Name**: Enter a name for each line in the sidebar list.
   - **Lock/Unlock**: Click the lock/unlock icon next to a line to prevent accidental edits.
   - **Hide/Show**: Click the eye/eye-off icon to toggle visibility of a line.
   - **Delete**: Click the trash icon to remove a line.

### Configurations

1. **Measurement Units**:

   - Set the "Ratio" value to convert pixels to real-world units.
   - Toggle the switch next to the ratio to display measurements in real-world units.

2. **Grid Settings**:

   - Enable/disable the grid using the switch in the grid settings row.
   - Set grid size (relative to real-world units), X offset, and Y offset.
   - Change grid color using the color picker.

3. **Visual Settings**:

   - Change line color using the color picker in the toolbar.
   - Change text color using the color picker in the text settings row.
   - Toggle text visibility with the switch next to text settings.

4. **Drawing Modes**:
   - **Auto Lock**: When enabled, lines are automatically locked after creation.
   - **Pixel Perfect**: When enabled, points snap to whole pixel coordinates.

### Managing Measurements

1. **Organizing Lines**:

   - Lines appear in the sidebar list where they can be rearranged via drag and drop.

2. **Data Export**:

   - Click the spreadsheet icon to export measurements as a CSV file.
   - The CSV includes line IDs, names, dimensions, angles, and lengths.

3. **Saving Work**:
   - Enter a name for your project in the text field at the top of the sidebar.
   - Click the save icon to save your work to the browser's local storage.
   - Previously saved projects can be accessed from the main page.

### Keyboard Shortcuts

- **Shift**: Hold to enable snapping while drawing or moving points.
- **Ctrl**: Hold to temporarily toggle between selection and drawing modes.
- **Undo/Redo**: Use Ctrl+Z and Ctrl+Y (or Command+Z and Command+Y on Mac) or the arrow icons in the toolbar to undo or redo actions.

## Limitations and Known Issues

1. **Browser Compatibility**:

   - The app uses modern web technologies and may not work correctly in older browsers.
   - Best experienced in latest Chromium-based browsers (Chrome, Edge, etc.).

2. **Large Images**:

   - Very large images may cause performance issues due to canvas rendering limitations.
   - Consider resizing extremely large images before upload for smoother performance.

3. **Mobile Support**:

   - The interface is optimized for desktop use with a mouse.
   - Limited functionality may be available on touch-only devices.

4. **Group Management**:

   - The multi-level hierarchy system is not yet implemented.

5. **Text Rotation**:

   - Text labels follow line orientation which may make them difficult to read when lines are at certain angles.

6. **Undo History**:

   - The undo history only tracks changes to lines and hierarchy, not to visual settings or configuration.

7. **Export Limitations**:

   - Currently only supports CSV export; no direct image export with measurement overlay.

8. **Image Formats**:
   - Supports common web image formats (PNG, JPG, GIF, etc.) but may not support specialized formats like DICOM or other scientific image formats.

## License

Image Measurer is licensed under the MIT License.
