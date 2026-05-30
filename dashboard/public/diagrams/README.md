# Interactive Diagrams

This directory contains interactive HTML visualizations of the GRC Engineering system architecture and processes.

## Available Diagrams

### 1. Risk Architecture Diagram
**File**: `risk-architecture-diagram.html`

Interactive visualization of the risk management architecture, showing:
- Risk identification and assessment processes
- Mitigation workflows
- Risk scoring methodology
- Integration points with other systems

### 2. Domain Taxonomy
**File**: `domain-taxonomy.html`

Hierarchical view of the GRC domain structure, including:
- Risk categories and subcategories
- Control frameworks
- Compliance standards mapping
- Asset classification

### 3. Health Score Algorithm
**File**: `health-score-algorithm.html`

Interactive breakdown of the health score calculation:
- Component weights and formulas
- Real-time score calculation
- Factor contribution analysis
- Trend visualization

### 4. Dashboard Views
**File**: `dashboard-views.html`

Preview of the dashboard interfaces:
- Executive summary view
- Risk management dashboard
- Compliance monitoring view
- Operational metrics view

## Usage

### Viewing the Diagrams
Simply open any HTML file in a modern web browser:
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Interactivity
All diagrams support:
- **Hover effects**: View details by hovering over elements
- **Click interactions**: Drill down into specific components
- **Zoom controls**: Navigate complex diagrams
- **Filter options**: Focus on specific areas

### Export Options
- **Screenshot**: Use browser screenshot functionality
- **Print**: Browser print to PDF
- **SVG export**: Right-click and save (where supported)

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Styling and animations
- **JavaScript**: Interactivity and calculations
- **SVG**: Scalable vector graphics
- **D3.js**: Data visualization (where applicable)

### Browser Requirements
- JavaScript enabled
- Modern browser with CSS3 support
- Minimum screen resolution: 1024x768

### Performance
- Optimized for fast loading
- Responsive design for various screen sizes
- No external dependencies (self-contained files)

## Customization

### Modifying Colors
Edit the CSS variables in each HTML file to match your branding:
```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;
  --accent-color: #f59e0b;
}
```

### Adding Data
For data-driven diagrams, modify the JavaScript data objects:
```javascript
const data = {
  // Add your data here
};
```

### Styling Changes
Customize the appearance by editing the CSS sections in each file.

## Troubleshooting

### Diagram Not Loading
- Ensure JavaScript is enabled
- Check browser console for errors
- Try a different browser
- Verify file is not corrupted

### Interactive Elements Not Working
- Clear browser cache
- Disable browser extensions
- Check for JavaScript errors
- Ensure file is opened directly (not through a proxy)

### Display Issues
- Adjust browser zoom level
- Try full-screen mode
- Check screen resolution
- Update browser to latest version

## Updates

### Version History
- **v1.0** (2026): Initial release with core diagrams

### Future Enhancements
- Additional diagram types
- Enhanced interactivity
- Real-time data integration
- Mobile optimization

## Support

For issues or questions about the diagrams:
1. Check this README for common solutions
2. Review the main project documentation
3. Open an issue in the project repository

## License

These diagrams are part of the GRC Engineering project and are licensed under the same MIT License. See the main LICENSE file for details.
