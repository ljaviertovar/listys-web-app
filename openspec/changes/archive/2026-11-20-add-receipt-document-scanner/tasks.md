# Tasks

## 1. Load the scanner engine

- [ ] 1.1 Add a pinned browser build of OpenCV.js 4.7.0 with its license notice, load it locally on scanner entry and verify asynchronous initialization in supported browsers.
- [x] 1.2 Add a feature-local browser adapter for frame detection and perspective correction, release OpenCV resources and cover valid contours, missing or invalid corners, extraction failure and repeated frame cleanup with synthetic images.

- [x] 1.3 Replace the single-pass paper detector with several masks, edge refinement, edge-support selection and live smoothing (geometry module with 14 pure tests, engine with released-resource tests); measured on simulated scenes before and after.

## 2. Add camera capture and review

- [ ] 2.1 Build the camera scanner in the receipt-upload feature with a rear-camera preference, a rate-limited detection overlay and the existing design-system tokens; verify loading, camera permission denial, unavailable devices and detectable versus undetectable receipt states.
- [ ] 2.2 Implement the full-screen scanner (photo-viewer style) and capture review with a Straightened / Full Photo choice, Use Photo and Retake, return to the camera for the next part with Done and Photos exits; verify original capture preservation when correction fails and release every media track on all exits.
- [x] 2.3 Add the **Scan Receipt** action with `ScanTextIcon` as the only primary option of the shared upload sheet on phones (drop zone first from `sm`), hide the counter and footer until there is a photo, swap the primary to Choose Photos when the camera fails, keep Choose Photos and drag and drop as alternatives, and add accepted scan files through the existing picker; verify mixed photo sources still respect five-photo, format and size limits.
- [x] 2.4 Verify that scanning from each shared upload entry point preserves existing success, OCR and optional shopping-session association behavior.
- [x] 2.5 Return to the photo upload form when camera access is denied or remains pending, preserve an actionable message, stop late streams and add E2E regressions for fallback and modal close.

- [x] 2.6 Add Adjust to the review: four draggable corners with a magnifier, arrow-key steps, no non-convex outline, a starting rectangle when no edges were found, and a camera request of up to 1920 by 1080.

## 3. Document and validate the feature

- [x] 3.1 Update the receipt-upload section of `docs/prd/PRD-v2.md` with the scanner-first capture flow, crop review and device-photo fallback; verify documented behavior and upload limits match the specs.
