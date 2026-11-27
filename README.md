# Heavenly Events

A static Vite + vanilla JavaScript luxury landing page with Tailwind CSS, GSAP ScrollTrigger, a responsive Canvas 2D image sequence, and Web3Forms enquiry handling. No backend or paid hosting is required for this project.

## Run locally

Requires Node 20.19+ (Node 22 recommended).

```sh
npm ci
npm run dev
```

The supplied 100 WebP concept frames work immediately. If frames are absent, run `npm run frames:generate`. The generator refuses to overwrite existing footage unless you explicitly add `-- --force`.

```sh
npm test
npm run build
npm run preview
```

`dist/` is the complete deployable website. Vite uses `base: './'` and frame paths use `import.meta.env.BASE_URL`, so repository subpaths on GitHub Pages work without hardcoded domain names. Open through an HTTP server, not a file:// URL.

## Connect enquiries

1. Obtain a public access key for your receiving email at https://web3forms.com/.
2. Copy `.env.example` to `.env.local`, replace `YOUR_ACCESS_KEY_HERE`, and restart Vite or rebuild. Alternatively replace the hidden `access_key` input in `index.html`.
3. Send a real test enquiry yourself after deployment and verify delivery to your inbox.

The public key is intentionally visible in the client. Do not put private credentials in Vite variables. Without a configured key the form displays an honest unavailable message and sends nothing. The handler prevents duplicate submissions, validates phone digits, checks API success, times out after 20 seconds, and preserves entered details on failure. A hidden honeypot is included. Review Web3Forms spam controls and current free-plan limits before launch; no static client can guarantee abuse prevention.

The 24-hour response copy is a business promise from the requested brief; ensure your team can honor it. Update privacy information for your actual business and data practices before public use.

## Real footage

See `public/frames/README.md` for the exact FFmpeg command. Replace all 100 illustrative frames with your own continuous walkthrough and remove the visible concept label when appropriate. The generated frames are stylized placeholders, not photorealistic venue footage.

## Engine decisions

- A 400vh track contains a 100svh viewport; ScrollTrigger pins it for the remaining track distance with `pinSpacing: false`, then releases naturally into the enquiry section.
- A single normalized timeline synchronizes frame progress and overlays at 10–25%, 45–60%, and 80–95%, with `scrub: 0.5`.
- Five concurrent requests load the first 15 frames; four background workers load the rest. Each request times out after eight seconds. The initial loading layer has a 12-second escape for network failure and never locks scrolling or enquiry navigation.
- The first available image renders immediately. Failed/pending frames resolve to the nearest loaded neighbor; if no image exists a gradient stays visible. Loading percentages count successful assets, not failed requests.
- Cover math centers and crops images without stretching. Canvas backing resolution honors device pixel ratio up to 2×, balancing Retina clarity and mobile GPU memory. ImageBitmap decoding is capped at 800px wide on small screens and 1440px otherwise; older browsers fall back to Image elements. Rendering is requested only when the frame/assets/size change, with no permanent animation loop.
- `ResizeObserver` handles container resize and orientation. Stable small-viewport units and `ignoreMobileResize` reduce mobile browser-toolbar pin jumps.
- Reduced-motion preference removes pinning and the long scroll track. Native links, visible focus indicators, labels, keyboard submission, live status, and success focus are provided. Without JavaScript the page and enquiry fields remain readable, but submission requires JavaScript.

## GitHub Pages

1. Commit this folder, including `package-lock.json` and all frame assets, to your own GitHub repository. Do not commit `.env.local` or `node_modules`.
2. Set the repository variable `VITE_WEB3FORMS_ACCESS_KEY` under Settings → Secrets and variables → Actions → Variables.
3. Under Settings → Pages, choose **GitHub Actions** as the source.
4. Push to `main` or manually run the included Deploy GitHub Pages workflow.

The workflow installs locked dependencies, tests, builds, uploads `dist/`, and deploys it. For another default branch, edit the workflow branch filter. GitHub Pages hosting eligibility depends on repository/account settings; a public repository is the usual free option. This project has not been published automatically.

## Before launch

Validation completed on 2026-11-27: production build and four Node tests passed; npm audit reported zero vulnerabilities. Headless Chrome checks against the built site mounted at `/heavenly-events/` passed at 1440×900, 390×844 (3× device pixel ratio), and 844×390. Checks covered all three story milestones, horizontal overflow, initial/background loading, reduced motion, missing-first-frame and all-frames-missing fallbacks, an unconfigured form, mocked API rejection and success, busy state, retained error input, and success focus/reset. No real enquiry was sent. Desktop, portrait, and landscape screenshots were visually reviewed.

Verify real assets, the access key and inbox delivery, your event copy, and actual iOS Safari / Android Chrome behavior on physical devices. Automated checks do not establish that every device is glitch-free. Keep the image sequence lightweight and test it on a throttled mobile connection.

References: https://gsap.com/docs/v3/Plugins/ScrollTrigger/ and https://docs.web3forms.com/how-to-guides/html-and-javascript
