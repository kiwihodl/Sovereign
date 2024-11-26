# JavaScript: Building Your First Interactive Web App

<!-- <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="https://plebdevs.com/api/get-video-url?videoKey=starter-lesson-5.mp4" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; border: 0px;" controls=""></video></div> -->

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="https://plebdevs-bucket.nyc3.cdn.digitaloceanspaces.com/starter-lesson-5.mp4" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; border: 0px;" controls=""></video></div>

## Introduction
In this lesson, we'll bring our web pages to life by adding dynamic functionality with JavaScript. We'll build a real-world application that displays and updates Bitcoin prices in real-time, teaching core JavaScript concepts along the way.

## Project Overview: Bitcoin Price Tracker
We'll build a web application that:
- Displays current Bitcoin price
- Updates automatically every 3 seconds
- Allows currency switching
- Includes interactive controls
- Shows current date/time

## Core JavaScript Concepts

### 1. Variables and Data Types
```javascript
// Variables can be declared with let or const
let currentCurrency = "USD";  // Can be changed
const interval = 3000;        // Cannot be changed

// Basic data types
const price = 45000;           // Number
const isVisible = true;        // Boolean
const currency = "USD";        // String
```

### 2. DOM Manipulation
```javascript
// Getting elements
const priceElement = document.getElementById('price');
const button = document.getElementById('refresh-button');

// Modifying content
priceElement.textContent = `${price} ${currency}`;

// Changing styles
priceElement.style.display = 'none';
```

### 3. Event Listeners
```javascript
// Basic click handler
button.addEventListener('click', () => {
    fetchBitcoinPrice();
});

// Change event for select elements
selector.addEventListener('change', (event) => {
    handleCurrencyChange(event.value);
});
```

### 4. Async Operations & Fetch API
```javascript
async function fetchBitcoinPrice() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        updatePrice(data.price);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

## Project Structure

### HTML Setup
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Bitcoin Price Tracker</title>
    <link rel="stylesheet" href="style.css">
    <script src="index.js" defer></script>
</head>
<body>
    <h1>Current Bitcoin Price</h1>
    <p>The price is: <span id="price"></span></p>
    <!-- Additional elements -->
</body>
</html>
```

### Core Functionality Implementation

1. **Setting Up the Timer**
```javascript
// Update price every 3 seconds
setInterval(fetchBitcoinPrice, 3000);

// Update date/time every second
setInterval(updateDateTime, 1000);
```

2. **Currency Selection**
```javascript
function handleCurrencyChange(newCurrency) {
    currentCurrency = newCurrency;
    fetchBitcoinPrice();
}
```

3. **Toggle Visibility**
```javascript
function togglePriceVisibility() {
    const price = document.getElementById('price');
    price.style.display = price.style.display === 'none' 
        ? 'inline' 
        : 'none';
}
```

## Best Practices

### 1. Error Handling
- Always use try/catch with async operations
- Provide meaningful error messages
- Handle edge cases gracefully

### 2. Code Organization
- Keep functions focused and small
- Use meaningful variable names
- Group related functionality
- Add comments for clarity

### 3. Performance
- Avoid unnecessary DOM updates
- Use appropriate update intervals
- Clean up intervals when not needed

## Common Challenges & Solutions

### 1. API Issues
```javascript
// Handle API failures gracefully
catch (error) {
    priceElement.textContent = 'Price unavailable';
    console.error('API Error:', error);
}
```

### 2. Currency Formatting
```javascript
function formatPrice(price, currency) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(price);
}
```

### 3. Time Zones
```javascript
function getLocalTime() {
    return new Date().toLocaleString();
}
```

## Extending the Project
Consider adding these features for practice:
1. Price change indicators (up/down arrows)
2. Historical price chart
3. Multiple cryptocurrency support
4. Price alerts
5. Local storage for settings

## Debugging Tips

### Using Console
```javascript
console.log('Price fetched:', price);
console.error('Error occurred:', error);
console.table(priceHistory);
```

### Chrome DevTools
1. Network tab for API calls
2. Console for errors
3. Elements for DOM inspection
4. Sources for debugging

## Additional Resources
- MDN JavaScript Guide
- JavaScript.info
- CoinGecko API Documentation
- Chrome DevTools Documentation

## Next Steps
1. Add styling with CSS
2. Implement additional features
3. Learn about React for more complex applications
4. Explore other APIs and cryptocurrencies

Remember: The best way to learn is by doing. Don't be afraid to break things and experiment with the code. The developer console is your friend for debugging and understanding what's happening in your application.

Happy coding! 🚀