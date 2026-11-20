# Design

## Context

`UploadTicketDialog` is the shared entry point for receipt uploads. `UploadTicketForm` passes validated image files from `usePhotoPicker` to the existing upload endpoint and optionally includes the originating shopping session. The current maximum is five JPEG or PNG images at 10 MB each. See `proposal.md` and the receipt-scanning and product-copy-clarity deltas for the user-visible contract.

## Goals / Non-Goals

**Goals:** Add browser-side receipt capture and perspective correction to the shared upload flow, review each result before upload and release camera and image-processing resources promptly.

**Non-Goals:** Change upload endpoints, OCR, storage, receipt review or session association contracts. Perform OCR or retain images in a new service.

## Decisions

- Add a scanner presentation within the existing upload-sheet flow. Its **Scan Receipt** entry uses the requested `ScanTextIcon` exported from the project's `@hugeicons/core-free-icons-v4` alias. Keep the existing picker, drag and drop, preview, rejection, upload and session-id paths as the source of truth for accepted files.
- Use the browser `getUserMedia` API with a rear-facing camera preference, invoked only after the user presses the scan action. Show the camera preview and detection overlay in a small feature component. Ask for up to 1920 by 1080 so the receipt is sharp enough to detect and to read; request the video stream only while the scanner is active, and stop every media track when capture review begins, scanning is canceled, the sheet closes or the component unmounts. Camera denial and unsupported browsers expose the existing device-photo path.
- Pin OpenCV.js to 4.7.0 and load it locally after the browser grants a camera stream, with its license notice in the established third-party location. Treat WebAssembly initialization as asynchronous and show a loading status before enabling capture. OpenCV 4.7 passes its own module to its readiness callback, so wrap the module in an object before resolving a native promise. The scanner does not use jscanify: its paper-contour helper took the largest outline of one Canny pass, which broke whenever the outline had a gap.
- Detect the receipt with several masks (brightness levels, local contrast and edges), each proposing rectangular blobs. A pure geometry module pulls every proposal onto the paper's real edge (a wide refinement pass then a narrow one; each side fits a line through the strongest clear step, limited to 7 degrees from the rough side) and keeps the candidate whose four sides show the clearest edge in one direction; a candidate that touches the frame is cut off and rejected. Live frames use at most 640 pixels on the longest side, fewer masks and one closing size so the outline keeps up; the shot uses 960 pixels and every mask. The live outline is smoothed between frames, survives three missed frames, and is used to crop the shot when the shot's own detection finds none within 1.5 seconds. Measured on simulated scenes made from the repository's test receipts (a corner counts as right within 5% of the receipt's diagonal): 24% for the previous detector against 100% for ordinary scenes and 92% for a receipt a quarter of the frame wide; scenes with striped, tiled, newsprint or plaid backgrounds, blur and low light stay near 47% overall, which is why the review offers Adjust.
- Produce the corrected review image as a JPEG `File`, then add it through `usePhotoPicker` so the existing MIME, decoding, count and size validations apply to scanned and selected photos equally. Use the existing multipart endpoint and upload success behavior, including optional `shopping_session_id`. Do not add a server contract or database change.
- Contain OpenCV interop in a feature-local browser adapter. Release every matrix and contour the adapter creates, also when an operation throws, and serialize frame analysis so a slower frame cannot build an unbounded queue. Keep the geometry (ordering, refinement, support, smoothing) free of OpenCV and the DOM so it is testable with plain numbers and synthetic images.
- Update the receipt-upload section of `docs/prd/PRD-v2.md` in the same change to describe camera scanning, review and device-photo fallback. Keep its upload limits and current OCR flow aligned with the implementation.

## Risks / Trade-offs

- **Low-contrast, glossy, curled or unusually long receipts can defeat contour detection or crop out printed content.** → Keep a visible detector result, inspect the captured crop, provide retake and use-original actions, and validate with varied synthetic and permitted sample images plus the existing OCR pipeline.
- **OpenCV adds a large download and WebAssembly initialization delay.** → Self-host pinned assets, load them only on explicit scan entry and expose a loading state. Verify production build and supported target browsers.
- **Continuous OpenCV processing can consume device memory and CPU.** → Analyze scaled frames no more than five times per second, avoid concurrent jobs, delete temporary matrices and release tracks at each flow transition.
- **JPEG encoding can produce an image larger than the existing upload limit.** → Validate the encoded file through the existing picker and tell the user to retake or choose a photo when it exceeds the limit.
- **Camera permission, device availability and secure-context requirements vary by browser.** → Request access from the user action, handle permission and device errors with a clear fallback, and verify HTTPS browser behavior on mobile.

## Migration Plan

No data migration or server rollout is required. Deploy the self-hosted scanner assets with the web application. Rollback disables or reverts the scanner entry point and scanner assets while the existing photo upload flow continues to accept receipts.
