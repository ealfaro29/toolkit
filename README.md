# Creative Toolkit

Welcome to the Creative Toolkit – a collection of web-based mini-applications designed to assist designers, developers, and creatives with various daily tasks. This toolkit brings together several utilities, from generating visual assets to organizing creative ideas, all within a simple and intuitive interface.

## 🚀 Features

The Creative Toolkit serves as a central hub for multiple standalone tools, each accessible from a dynamic and reorderable homepage.

### Homepage (`index.html`)
*   **App Launcher**: Easily navigate to any of the mini-apps with a single click.
*   **Drag-and-Drop Reordering**: Rearrange the app cards on the homepage by dragging and dropping them into your preferred order.
*   **Persistence**: Your custom card order is automatically saved in your browser's local storage and will be restored on your next visit.
*   **Theme Switching**: A global theme toggle (Light, Dark, System) ensures a comfortable viewing experience across all applications.

### Mini-Apps Included:

1.  **Moodboard Studio**
    *   Create inspiring moodboards with custom titles, client logos, color palettes, and multiple images.
    *   Add images by drag-and-drop or file selection.
    *   Reorder images within the moodboard via drag-and-drop.
    *   Export your complete moodboard as a high-resolution PNG image.

2.  **Blob Studio**
    *   Generate unique and organic SVG blob shapes.
    *   Control parameters like number of points, smoothness, and variance.
    *   Randomize button for quick new ideas.
    *   Share blob shapes via URL.
    *   Download generated blobs as SVG files for use in other projects.

3.  **Jigsaw Generator**
    *   Design custom vector jigsaw puzzle grids.
    *   Adjust the number of rows, columns, gap between pieces, and tab size.
    *   Randomly generate new puzzle piece shapes.
    *   Download the complete jigsaw layout as an SVG file.

4.  **Icon Factory**
    *   Combine predefined frame and particle SVG elements to create custom icons.
    *   Search and filter available frames and particles.
    *   Preview generated icons.
    *   Build a collection of your favorite custom icons.
    *   Copy individual icon SVG code to clipboard or download the entire collection as a ZIP file.

5.  **QR Code Generator**
    *   Create various types of QR codes: URLs, plain text, email, phone numbers, SMS, WiFi network credentials, and vCards.
    *   All QR codes are generated locally within your browser, ensuring privacy and offline functionality.
    *   Download generated QR codes as PNG images.

6.  **Color Mixer**
    *   Explore and generate harmonic color palettes based on a single base color.
    *   Choose from analogous, monochromatic, triadic, and complementary harmony rules.
    *   Interactive color wheel and HEX input.
    *   Lock the base color to explore harmonies around it.
    *   Discover and copy CSS for beautiful gradient combinations.
    *   Download the generated palette and gradients as a PNG image.

7.  **Locator**
    *   Geocode lists of locations and visualize them on an interactive world map.
    *   Input locations separated by semicolons or newlines.
    *   Resolve ambiguous location names with a selection popup.
    *   Highlight countries where locations are placed ("Fill Countries" option).
    *   Zoom to individual locations and remove them from the list.
    *   Export the map with your locations as an SVG file.

## 🛠️ Project Structure

The project is organized as follows:
creative-toolkit/
├── index.html # Main homepage
├── blobs/
│ ├── blobs.html # Blob Studio application
│ └── ... (assets for Blob Studio)
├── colors/
│ ├── colors.html # Color Mixer application
│ ├── colors.json # Color name data
│ └── ... (other assets)
├── iconfactory/
│ ├── iconfactory.html # Icon Factory application
│ ├── frames/ # SVG files for icon frames
│ ├── particles/ # SVG files for icon particles
│ ├── names.json # Custom icon names
│ ├── keywords.json # Keywords for icon search
│ └── ... (other assets)
├── jigsaws/
│ ├── jigsaws.html # Jigsaw Generator application
│ └── ... (assets for Jigsaw Generator)
├── locator/
│ ├── locator.html # Locator application
│ └── ... (assets for Locator)
├── moodboards/
│ ├── moodboards.html # Moodboard Studio application
│ └── ... (assets for Moodboard Studio)
├── qrcodes/
│ ├── qrcodes.html # QR Code Generator application
│ └── ... (assets for QR Code Generator)
└── screenshot.png # (Optional) Project screenshot
code
Code
## 🚀 Getting Started

To use the Creative Toolkit:

1.  **Clone the repository** (if hosted on Git) or download the project files.
2.  **Open `index.html`** in your preferred web browser (e.g., Chrome, Firefox, Edge).
3.  From the homepage, simply **click on any app card** to launch the desired tool.
4.  **Drag and drop app cards** on the homepage to rearrange them. Your layout will be saved automatically.
5.  Use the **theme toggle** in the header to switch between light, dark, and system themes.

Each mini-app has specific instructions and tips within its interface to guide you.

## 💻 Technologies Used

*   **HTML5**: Structure and content for all applications.
*   **CSS3**: Styling and responsiveness, including CSS variables for theming.
*   **JavaScript (ES6+)**: Core logic, interactive elements, and application state management.
*   **External Libraries**:
    *   `@jaames/iro`: For the interactive color wheel in Color Mixer.
    *   `html2canvas`: For exporting Moodboards and Color Mixer results as PNGs.
    *   `maplibre-gl`: For the interactive map in Locator.
    *   `davidshimjs-qrcodejs`: For QR code generation.
    *   `JSZip`: For downloading icon collections in Icon Factory.
    *   `Nominatim API`: (External service) Used by Locator for geocoding.

## ✨ Future Enhancements

*   Add more mini-applications to expand the toolkit's functionality.
*   Implement a "favorites" section for quick access to frequently used tools.
*   Improve accessibility features across all applications.
*   Allow customization of theme accent colors.
*   Add a settings page for global preferences.

## 📄 License

This project is open-source and available under the Unlicense License.
