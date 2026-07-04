# Roomio Neobrutalism Design System - 100% Exact AI Prompt

You are an expert Frontend Developer and UI/UX Designer. Your task is to build a web application using **Tailwind CSS v4** strictly following the "Roomio Soft Neobrutalism" design system detailed below. 

This design system is characterized by soft rounded corners, thick black borders, hard offset shadows, vibrant soft colors (blues), and highly physical, springy micro-interactions.

**CRITICAL:** Do NOT deviate from these rules. Do not use standard Tailwind shadows (e.g., `shadow-md`). Always apply these exact custom styles, HTML structures, AND the global JavaScript logic. If you fail to implement the physical tap animations and radial hovers properly, you have failed the prompt.

## 1. Global Setup & Tailwind v4 Theme
Add the following to the main `app.css` (or equivalent global stylesheet). This defines the core theme and animations.

```css
@import 'tailwindcss';

@font-face {
  font-family: 'Google Sans';
  src: url('/fonts/GoogleSansOTF/GoogleSans-Regular.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Google Sans';
  src: url('/fonts/GoogleSansOTF/GoogleSans-Medium.otf') format('opentype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Google Sans';
  src: url('/fonts/GoogleSansOTF/GoogleSans-Bold.otf') format('opentype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@theme {
  --font-sans: 'Google Sans', system-ui, sans-serif;
  
  /* Neobrutalism Hard Shadows */
  --shadow-primary: 4px 4px 0px -1px #000000;
  --shadow-secondary: 2px 2px 0px -1px #000000;
  --shadow-secondary-opposite: -2px 2px 0px -1px #000000;

  /* Brand Colors */
  --color-primary-blue: rgb(147, 197, 253);    /* blue-300 */
  --color-primary-dark: rgb(96, 165, 250);     /* blue-400 */
  --color-primary-light: rgb(219, 234, 254);   /* blue-100 */
  --color-primary-lighter: rgb(239, 246, 255); /* blue-50 */
  --color-primary-medium: rgb(191, 219, 254);  /* blue-200 */
}

@layer base {
  body {
    @apply bg-white text-black antialiased;
    font-family: 'Google Sans', sans-serif;
    -webkit-tap-highlight-color: transparent;
    overscroll-behavior: none;
  }
}

/* Subtle Grid Background */
.roomio-grid-bg {
  background-image:
    linear-gradient(to right, rgba(156, 163, 175, 0.22) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(156, 163, 175, 0.22) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

## 2. The Physical "Tap Sink" Interactions (CRITICAL)
Buttons must feel highly physical. When pressed, they physically depress into the page.

**Add these utility classes to global CSS:**
```css
[class*='shadow-primary'] {
  --tap-depth: 2px;
  --tap-shadow: var(--shadow-primary);
}
[class*='shadow-secondary'] {
  --tap-depth: 1px;
  --tap-shadow: var(--shadow-secondary);
}

/* The Springy Transition */
:where(button, a, [role='button']):where([class*='shadow-primary'], [class*='shadow-secondary']) {
  transition-property: background-color, border-color, color, opacity, transform, box-shadow;
  transition-duration: 150ms, 150ms, 150ms, 150ms, 200ms, 200ms;
  transition-timing-function: ease, ease, ease, ease, cubic-bezier(0.34, 1.56, 0.64, 1), cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Native Hover/Active Fallback */
:where(button, a, [role='button']):where([class*='shadow-primary'], [class*='shadow-secondary']):active {
  transform: translate(var(--tap-depth, 1px), var(--tap-depth, 1px)) !important;
  box-shadow: none !important;
  transition: transform 80ms ease, box-shadow 80ms ease !important;
}

/* JS-Driven Classes for Touch/Mobile */
.tap-bounce {
  animation: tap-bounce 250ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.tap-sink {
  transform: translate(var(--tap-depth, 1px), var(--tap-depth, 1px)) !important;
  box-shadow: none !important;
  transition: transform 80ms ease, box-shadow 80ms ease !important;
}

@keyframes tap-bounce {
  0% { transform: translate(var(--tap-depth, 1px), var(--tap-depth, 1px)); box-shadow: none; }
  1% { transform: translate(calc(var(--tap-depth, 1px) - 0.05px), calc(var(--tap-depth, 1px) - 0.05px)); box-shadow: var(--tap-shadow, var(--shadow-secondary)); }
  50% { transform: translate(-0.5px, -0.5px); box-shadow: var(--tap-shadow, var(--shadow-secondary)); }
  100% { transform: translate(0, 0); box-shadow: var(--tap-shadow, var(--shadow-secondary)); }
}
```

## 3. Advanced Hover Animations (The "Wow" Factor)
For Toolbar actions or Modal primary actions, use a radial clip-path hover effect.

**Add to global CSS:**
```css
.modal-action {
  --hover-x: 50%;
  --hover-y: 50%;
  position: relative;
  isolation: isolate;
  overflow: hidden;
}
.modal-action::before {
  position: absolute;
  z-index: 0;
  inset: 0;
  background: #fff;
  clip-path: circle(0 at var(--hover-x) var(--hover-y));
  content: '';
  transition: clip-path 320ms cubic-bezier(0.22, 1, 0.36, 1);
}
.modal-action:not(:disabled):hover::before {
  clip-path: circle(160% at var(--hover-x) var(--hover-y));
}
.modal-action-label {
  position: relative;
  z-index: 1;
  display: inline-block;
  transform-origin: center;
  transition: color 150ms ease;
}
.modal-action:not(:disabled):hover .modal-action-label {
  color: #2563eb;
  font-weight: 900;
  animation: toolbar-action-label-pop 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-action > svg { position: relative; z-index: 1; }

@keyframes toolbar-action-label-pop {
  0%, 100% { transform: scale(1); }
  52% { transform: scale(1.08); }
}

@keyframes scale-up {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

## 4. Global JavaScript Interaction Logic (CRITICAL for 100% Match)
To make the `--hover-x/y` coordinates work for the radial animation, and to ensure touch devices trigger the physical button bounce properly without immediate page navigation cutting off the animation, **you MUST implement this global JS script** (e.g., in your root `+layout.svelte` `onMount` or `index.html`):

```javascript
const TAP_ACTION_DELAY = 200;

function findTapTarget(target) {
  if (!(target instanceof Element)) return null;
  const interactive = target.closest('button, a[href], [role="button"]');
  if (!interactive || interactive.dataset.tapImmediate === 'true') return null;
  if (interactive.closest('[data-tap-zone="plain"]')) return null;
  if (interactive.matches(':disabled, [aria-disabled="true"]')) return null;
  return interactive;
}

function bounceTouchTarget(element) {
  element.classList.remove('tap-sink', 'tap-bounce');
  void element.offsetWidth; // trigger reflow
  element.classList.add('tap-sink');

  window.setTimeout(() => {
    if (!document.body.contains(element)) return;
    element.classList.remove('tap-sink');
    void element.offsetWidth;
    element.classList.add('tap-bounce');
  }, 100);
}

// 1. Handle touch/mobile bounce
document.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'touch') return;
  const interactive = findTapTarget(event.target);
  if (interactive) bounceTouchTarget(interactive);
}, { passive: true });

// 2. Track mouse for radial clip-path hover origin
document.addEventListener('pointerover', (event) => {
  if (!(event.target instanceof Element)) return;
  const action = event.target.closest('.toolbar-action, .modal-action');
  if (!action || action.matches(':disabled')) return;
  
  const bounds = action.getBoundingClientRect();
  action.style.setProperty('--hover-x', `${event.clientX - bounds.left}px`);
  action.style.setProperty('--hover-y', `${event.clientY - bounds.top}px`);
}, { passive: true });

// 3. Delay navigation so animations finish playing
document.addEventListener('click', (event) => {
  const interactive = findTapTarget(event.target);
  if (!interactive) return;

  const anchor = interactive instanceof HTMLAnchorElement ? interactive : interactive.closest('a[href]');
  if (anchor) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (anchor.target && anchor.target !== '_self') return;
    if (anchor.hasAttribute('download')) return;
    
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;

    event.preventDefault();
    window.setTimeout(() => {
      // Execute your router's navigation here, e.g. window.location.assign()
      window.location.href = `${url.pathname}${url.search}${url.hash}`;
    }, TAP_ACTION_DELAY);
  }
}, true);

// 4. Cleanup animation classes
document.addEventListener('animationend', (event) => {
  if (event.animationName === 'tap-bounce' && event.target instanceof HTMLElement) {
    event.target.classList.remove('tap-bounce');
  }
}, { passive: true });
```

## 5. DOM Structure & Component Rules
To achieve the 100% exact look, you MUST use these exact class combinations.

### A. Primary Buttons
```html
<button class="flex cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border-2 border-black bg-blue-300 px-4 py-2.5 text-sm font-black text-black shadow-secondary transition-all hover:bg-blue-400">
  Submit <LucideIcon class="h-4 w-4" />
</button>
```

### B. Modal Action Buttons (With pop effect)
```html
<button class="modal-action flex cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-blue-300 px-4 py-2 text-xs font-black text-black shadow-secondary transition-all disabled:opacity-50">
  <span class="modal-action-label">Lưu thay đổi</span>
  <LucideIcon class="h-4.5 w-4.5" />
</button>
```

### C. Standard Inputs
```html
<input type="text" class="w-full rounded-lg border-2 border-black bg-white px-2.5 py-1.5 text-xs font-semibold text-black focus:ring-2 focus:ring-blue-300 focus:outline-none" />
```

### D. Modals / Dialogs
Always use this structure for modals, incorporating the `scale-up` animation.
```html
<!-- Backdrop -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
  <!-- Dialog Window -->
  <div class="relative flex max-h-[90vh] w-full max-w-md animate-[scale-up_0.2s_ease-out] flex-col overflow-hidden rounded-lg border-2 border-black bg-white shadow-primary">
    
    <!-- Header -->
    <div class="flex shrink-0 items-center px-6 pt-5 select-none">
      <span class="text-base font-black text-black">Title</span>
      <button class="ml-auto cursor-pointer rounded-[6px] p-1 text-black hover:bg-zinc-100">
        <XIcon class="h-4.5 w-4.5" />
      </button>
    </div>
    
    <!-- Body -->
    <div class="overflow-y-auto p-6 space-y-4"> ... </div>
  </div>
</div>
```

### E. Cards
```html
<!-- Standard Card -->
<div class="rounded-lg border-2 border-black bg-white shadow-secondary p-4">
  <h3 class="text-sm font-black text-black">Card Title</h3>
</div>
```

## 6. Custom Scrollbar
```css
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #f1f1f1; }
::-webkit-scrollbar-thumb {
  background: #93c5fd;
  border: 2px solid black;
}
::-webkit-scrollbar-thumb:hover { background: #60a5fa; }
::selection { background: rgb(147, 197, 253); color: black; }
```
