# Security Report

This document provides a security and risk assessment of the third-party libraries and APIs used within the Creative Toolkit. All tools operate client-side in the browser, ensuring user data remains private and never leaves the local environment.

---

## Photopea API
- **License:** Proprietary. Photopea is free to use, but its API and white-label integration mode may require commercial agreements. All works created belong to the user.  
- **Implementation:** Used in the **Any2SVG** tool for converting AI, PSD, and PDF files to SVG. Communication is handled via an iframe and the `postMessage` API between the app and the Photopea editor.  
- **Risk/Security Level:** **None.** Processing occurs entirely client-side. Files are never uploaded to servers. The Photopea privacy policy confirms that user files are not transmitted to their servers.  

---

## ONNX Runtime Web
- **License:** MIT.  
- **Implementation:** Used in the **Background Remover** to run the quantized RMBG-1.4 machine learning model directly in the browser. Images are processed locally to remove the background.  
- **Risk/Security Level:** **None.** Execution is fully client-side. User images are never sent to servers. WebAssembly and WebGL ensure optimized performance and secure execution.  

---

## JSZip
- **License:** MIT and GPLv3.  
- **Implementation:** Used in the **Icon Factory** to generate a `.zip` archive containing all user-created SVG icons, enabling bulk download.  
- **Risk/Security Level:** **None.** Older versions of JSZip had known vulnerabilities such as "Zip Slip" and DoS. Version 3.10.1, used here, has no known direct vulnerabilities. Current implementation is limited to local ZIP creation.  

---

## MapLibre GL JS
- **License:** BSD-3-Clause.  
- **Implementation:** Forms the core of the **Locator** tool, rendering interactive maps, visualizing geospatial data, and geocoding locations.  
- **Risk/Security Level:** **None.** Actively maintained open-source library with no known direct vulnerabilities.  

---

## html2canvas
- **License:** MIT.  
- **Implementation:** Used in **Moodboard Studio** to capture the current moodboard state (images, colors, logo) and export it as a high-quality PNG image.  
- **Risk/Security Level:** **None to Low.** No direct vulnerabilities reported by Snyk. However, some audits note possible code injection risks when handling untrusted external data. In this case, the implementation is secure as it only processes user-generated content within the app.  

---

## iro.js
- **License:** MPL 2.0 (Mozilla Public License 2.0).  
- **Implementation:** Serves as the interactive color picker in the **Color Mixer**, allowing users to select a base color for generating harmonious palettes.  
- **Risk/Security Level:** **None.** Standalone library with no external dependencies. No vulnerabilities are known.  

---

## QRCode.js
- **License:** MIT.  
- **Implementation:** Used in the **QR Code Generator** to create visual QR codes from text, URLs, WiFi credentials, or contact information.  
- **Risk/Security Level:** **None.** Simple, dependency-free implementation with no reported vulnerabilities.  

---

## Potrace
- **License:** GPLv2+ (GNU General Public License v2 or later).  
- **Implementation:** Used in **Signature to SVG** to trace bitmap images (signatures) into clean, scalable SVG vectors.  
- **Risk/Security Level:** **None.** Runs fully client-side. No known vulnerabilities in the current implementation.  
