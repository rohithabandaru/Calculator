# React Native Scientific Calculator 🔢✨

Hey! This is a clean, minimal scientific calculator I built for iOS and Android. I wanted something that felt super responsive, had satisfying haptic feedback, and could handle advanced math without looking like a cluttered mess from the early 2000s. 

## 📱 What it looks like
*(Add your own screenshots or a quick demo GIF here!)*

---

## ✨ Features (The Cool Stuff)

*   **⚡ Live Preview:** You don't have to keep tapping the `=` key. The app figures out the math and shows you a live preview of the result instantly as you type.
*   **📐 Real Scientific Math Engine:** It handles everything from basic arithmetic to advanced stuff:
    *   Trig functions (`sin`, `cos`, `tan` and their inverses `sin⁻¹`, `cos⁻¹`, `tan⁻¹`)
    *   Logarithms (`log`, `ln`) and constants (`π`, `e`)
    *   Exponents & roots (`x²`, `x³`, `xʸ`, `10ˣ`, `eˣ`, `√`, `³√`)
    *   Factorials (`n!`) and percentages (`%`)
*   **🔄 History Log:** It automatically saves your past equations. You can scroll through them, clear the list, or just tap an old calculation to load it right back into the display.
*   **🎯 Angle Modes:** Easily switch between **Degrees** and **Radians** depending on what math you're working on.
*   **📳 Satisfying Clicks:** I integrated native haptics so every button press has a light, tactile physical vibration. It makes the app feel like a real calculator.
*   **🎨 Minimal & Responsive UI:** Vibrant custom colors, beautiful dark-themed styling, and layouts that scale to fit any phone screen size perfectly.

---

## 🛠️ How it's built

*   **React Native** — For a fast, native cross-platform build.
*   **TypeScript** — Helps keep all the complex math logic and equation parsing completely error-free.
*   **React Hooks** — Clean, straightforward state management without heavy libraries.

---

## 🏃‍♂️ Running it locally

### 1. Grab dependencies
```bash
npm install
# or
yarn install
```

### 2. Install iOS Pods (Mac only)
```bash
cd ios && pod install && cd ..
```

### 3. Start the dev server
```bash
npm start
```
Then press `a` for Android or `i` for iOS!
