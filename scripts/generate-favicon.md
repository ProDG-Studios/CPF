# Generate Favicon.ico

To create a favicon.ico file from the SVG:

1. **Online Tool (Recommended)**:
   - Visit https://favicon.io/favicon-converter/
   - Upload the `public/favicon.svg` file
   - Download the generated favicon.ico
   - Place it in the `public/` folder

2. **Alternative Tool**:
   - Visit https://convertio.co/svg-ico/
   - Upload `public/favicon.svg`
   - Download and save as `public/favicon.ico`

3. **Using ImageMagick (if installed)**:
   ```bash
   convert public/favicon.svg -resize 32x32 public/favicon.ico
   ```

The SVG favicon will work in modern browsers, but .ico provides better compatibility with older browsers.
