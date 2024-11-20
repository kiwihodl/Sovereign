# CSS Fundamentals: Styling Your First Webpage

<!-- <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="https://plebdevs.com/api/get-video-url?videoKey=starter-lesson-5.mp4" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; border: 0px;" controls=""></video></div> -->

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="https://plebdevs-bucket.nyc3.cdn.digitaloceanspaces.com/starter-lesson-4.mp4" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; border: 0px;" controls=""></video></div>

## Introduction
In our previous lesson, we created the structure of our webpage with HTML. Now, we'll learn how to style it using CSS (Cascading Style Sheets). While HTML provides the bones of our webpage, CSS adds the visual presentation - the colors, layouts, spacing, and overall aesthetics.

## What is CSS?

### Definition
CSS (Cascading Style Sheets) is a stylesheet language that controls the visual presentation of HTML documents. Think of it like the paint, decorations, and interior design of a house - it determines how everything looks and is arranged.

### Key Concepts

1. **Styling Capabilities**
   - Fonts and typography
   - Colors and backgrounds
   - Margins and padding
   - Element sizes
   - Visual effects
   - Layout and positioning

2. **Cascading Nature**
   - Styles can be inherited from parent elements
   - Multiple styles can apply to the same element
   - Specificity determines which styles take precedence
   - Styles "cascade" down through your document

## Basic CSS Syntax

```css
selector {
    property: value;
}
```

### Example:
```css
h1 {
    color: blue;
    font-size: 24px;
    margin-bottom: 20px;
}
```

## Connecting CSS to HTML

### Method 1: External Stylesheet (Recommended)
```html
<link rel="stylesheet" href="style.css">
```

### Method 2: Internal CSS
```html
<style>
    h1 {
        color: blue;
    }
</style>
```

### Method 3: Inline CSS (Use Sparingly)
```html
<h1 style="color: blue;">Title</h1>
```

## The Box Model
Every HTML element is treated as a box in CSS, with:

```
┌──────────────────────┐
│       Margin         │
│   ┌──────────────┐   │
│   │   Border     │   │
│   │ ┌──────────┐ │   │
│   │ │ Padding  │ │   │
│   │ │ ┌──────┐ │ │   │
│   │ │ │      │ │ │   │
│   │ │ │Content│ │ │   │
│   │ │ │      │ │ │   │
│   │ │ └──────┘ │ │   │
│   │ └──────────┘ │   │
│   └──────────────┘   │
└──────────────────────┘
```

- **Content**: The actual content of the element
- **Padding**: Space between content and border
- **Border**: The border around the padding
- **Margin**: Space outside the border

## CSS Units

### Absolute Units
- `px` - pixels
- `pt` - points
- `cm` - centimeters
- `mm` - millimeters
- `in` - inches

### Relative Units
- `%` - percentage relative to parent
- `em` - relative to font-size
- `rem` - relative to root font-size
- `vh` - viewport height
- `vw` - viewport width

## Practical Example: Styling Our Webpage

### 1. Basic Page Setup
```css
body {
    min-height: 100vh;
    margin: 0;
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    display: flex;
    flex-direction: column;
}
```

### 2. Header Styling
```css
header {
    background-color: #333;
    color: white;
    padding: 20px;
    text-align: center;
}
```

### 3. Main Content Area
```css
main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    flex: 1;
}
```

### 4. Footer Styling
```css
footer {
    background-color: #333;
    color: white;
    padding: 10px;
    text-align: center;
}
```

## Layout with Flexbox

### Basic Concept
Flexbox is a modern layout system that makes it easier to create flexible, responsive layouts.

### Key Properties
```css
.container {
    display: flex;
    flex-direction: row | column;
    justify-content: center | space-between | space-around;
    align-items: center | flex-start | flex-end;
}
```

### Common Use Cases
1. Centering content
2. Creating navigation bars
3. Building responsive layouts
4. Equal-height columns
5. Dynamic spacing

## Best Practices

### 1. Organization
- Use consistent naming conventions
- Group related styles together
- Comment your code for clarity
- Keep selectors simple and specific

### 2. Performance
- Avoid unnecessary specificity
- Use shorthand properties when possible
- Minimize redundant code
- Consider load time impact

### 3. Maintainability
- Use external stylesheets
- Follow a consistent formatting style
- Break large stylesheets into logical files
- Document important design decisions

## Debugging CSS

### Common Tools
1. Browser Developer Tools
   - Element inspector
   - Style inspector
   - Box model viewer

### Common Issues
1. Specificity conflicts
2. Inheritance problems
3. Box model confusion
4. Flexbox alignment issues

## Exercises

### 1. Style Modifications
Try modifying these properties in your stylesheet:
```css
/* Change colors */
header {
    background-color: #4a90e2;
}

/* Adjust spacing */
main {
    padding: 40px;
}

/* Modify typography */
h1 {
    font-size: 32px;
    font-weight: bold;
}
```

### 2. Layout Challenge
Create a card layout using Flexbox:
```css
.card-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.card {
    flex: 1;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

## Additional Resources

### Learning Tools
1. [Flexbox Froggy](https://flexboxfroggy.com/) - Interactive Flexbox learning game
2. [CSS-Tricks](https://css-tricks.com) - Excellent CSS reference and tutorials
3. [MDN CSS Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS)

### Practice Projects
1. Style your personal webpage
2. Create a responsive navigation menu
3. Build a flexible card layout
4. Design a custom button style

Remember: CSS is both an art and a science. Don't be afraid to experiment and break things - that's how you'll learn the most. The key is to start simple and gradually add complexity as you become more comfortable with the basics.

Next up, we'll dive into JavaScript to add interactivity to our webpage! 🚀