# Introduction to HTML: Building Your First Webpage

<!-- <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="https://plebdevs.com/api/get-video-url?videoKey=starter-lesson-4.mp4" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; border: 0px;" controls=""></video></div> -->

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="https://plebdevs-bucket.nyc3.cdn.digitaloceanspaces.com/starter-lesson-3.mp4" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; border: 0px;" controls=""></video></div>

## What is HTML?
HTML (HyperText Markup Language) is the foundation of all webpages. Think of it as the framing of a house - it provides the basic structure that everything else builds upon.

### Key Concepts
- HTML is a markup language, not a programming language
- It tells browsers how to structure web content
- Every HTML element is like a building block
- Browsers interpret HTML to display content

## The Building Analogy
When building a webpage, think of it like constructing a house:
- **HTML**: The framing and structure (walls, rooms, layout)
- **CSS**: The design elements (paint, decorations, styling)
- **JavaScript**: The functionality (plumbing, electrical, moving parts)

## Basic HTML Structure

### 1. HTML Boilerplate
Every webpage starts with a basic template:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Page Title</title>
</head>
<body>
    <!-- Your content goes here -->
</body>
</html>
```

### 2. Understanding the Parts
- `<!DOCTYPE html>`: Tells browsers this is an HTML5 document
- `<html>`: The root element of the page
- `<head>`: Contains metadata about the document
- `<body>`: Contains the visible content

## Essential HTML Elements

### 1. Headings
HTML has six levels of headings:
```html
<h1>Main Title</h1>
<h2>Subtitle</h2>
<h3>Section Header</h3>
<!-- ... -->
<h6>Smallest Heading</h6>
```

### 2. Paragraphs
```html
<p>This is a paragraph of text. It can contain as much text as you need.</p>
```

### 3. Images
```html
<img src="path-to-image.jpg" alt="Description of image" width="300">
```

### 4. Links
```html
<a href="https://example.com">Click here</a>
```

## HTML Attributes
Attributes provide additional information or modify HTML elements:

```html
<tag attribute="value">Content</tag>
```

Common attributes:
- `src`: Source path for images
- `href`: Destination for links
- `alt`: Alternative text for images
- `class`: CSS class names
- `id`: Unique identifier
- `style`: Inline CSS styles

## Semantic HTML

### What is Semantic HTML?
Semantic HTML uses meaningful tags that describe their content's purpose. This improves:
- Accessibility
- SEO (Search Engine Optimization)
- Code readability
- Maintainability

### Common Semantic Elements
```html
<header>
    <!-- Site header content -->
</header>

<nav>
    <!-- Navigation menu -->
</nav>

<main>
    <!-- Main content -->
    <article>
        <!-- Self-contained content -->
    </article>
    
    <section>
        <!-- Grouped content -->
    </section>
</main>

<footer>
    <!-- Site footer content -->
</footer>
```

### Non-Semantic vs Semantic Example
Instead of:
```html
<div class="header">
    <div class="navigation">
        <div class="nav-item">Home</div>
    </div>
</div>
```

Use:
```html
<header>
    <nav>
        <a href="/">Home</a>
    </nav>
</header>
```

## Building Your First Webpage

### 1. Basic Structure
```html
<!DOCTYPE html>
<html>
<head>
    <title>My First Webpage</title>
</head>
<body>
    <header>
        <h1>Welcome to My First Webpage!</h1>
    </header>
    
    <main>
        <section>
            <h2>About Me</h2>
            <p>Hi, I'm learning web development with PlebDevs!</p>
        </section>
        
        <section>
            <h2>My Interests</h2>
            <p>I'm interested in Bitcoin, programming, and building cool stuff!</p>
        </section>
    </main>
    
    <footer>
        <p>Created by [Your Name] - 2024</p>
    </footer>
</body>
</html>
```

## Best Practices

### 1. Structure
- Use proper indentation
- Keep code organized and readable
- Use semantic elements when possible
- Include all required elements (`DOCTYPE`, `html`, `head`, `body`)

### 2. Content
- Use appropriate heading levels (start with `h1`)
- Write descriptive `alt` text for images
- Keep content meaningful and organized
- Use comments to explain complex sections

### 3. Accessibility
- Use semantic HTML elements
- Provide alternative text for images
- Maintain a logical heading structure
- Ensure content makes sense when read linearly

## Common Issues and Solutions

### Problem: Images Not Loading
```html
<!-- Wrong -->
<img src="image.jpg">

<!-- Right -->
<img src="./images/image.jpg" alt="Description">
```

### Problem: Links Not Working
```html
<!-- Wrong -->
<a>Click here</a>

<!-- Right -->
<a href="https://example.com">Click here</a>
```

## Next Steps

1. **Practice Building**
   - Create a personal webpage about yourself
   - Include different types of content (text, images, links)
   - Use semantic HTML elements

2. **Experiment with Structure**
   - Try different layouts
   - Use various HTML elements
   - Pay attention to semantic meaning

3. **Prepare for CSS**
   - Think about how you want your page to look
   - Consider what styles you'll want to add
   - Plan your layout structure

## Exercise: Create Your Profile Page

Try creating a simple profile page using what you've learned:

1. Use the HTML boilerplate
2. Add a header with your name
3. Include an "About Me" section
4. Add a photo (if you want)
5. List your interests or goals
6. Add a footer with contact information

Remember to:
- Use semantic HTML
- Include appropriate headings
- Add descriptive alt text for images
- Keep your code clean and well-organized

## Additional Resources
- [MDN HTML Guide](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [HTML5 Doctor (Semantic Elements)](http://html5doctor.com/)
- [W3Schools HTML Tutorial](https://www.w3schools.com/html/)

Remember: HTML is the foundation of web development. Take time to understand these basics well, as they'll serve as the building blocks for everything else you'll learn. Happy coding! 🚀