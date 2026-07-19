# EchoSphere X

### Offline Acoustic Image Transmission Platform using Multiple Frequency Shift Keying (MFSK)

![License](https://img.shields.io/badge/License-GPLv3-blue.svg)
![Status](https://img.shields.io/badge/Status-Active%20Development-success)
![Platform](https://img.shields.io/badge/Platform-Web-orange)
![Research](https://img.shields.io/badge/Category-Digital%20Signal%20Processing-purple)

> **Transmit digital images through sound. No internet. No radio. No network infrastructure. Just acoustics.**

EchoSphere X is an open-source experimental communication platform that demonstrates how digital images can be encoded into acoustic signals using **Multiple Frequency Shift Keying (MFSK)** and reconstructed back into their original form.

The project explores an alternative communication paradigm where speakers and microphones become the transmission medium, enabling offline digital communication in environments where conventional connectivity is unavailable or unreliable.

Designed with a strong focus on **Digital Signal Processing (DSP)**, **communication systems**, and **biomedical engineering**, EchoSphere X serves as both an educational platform and a research prototype for resilient acoustic data transmission.

---

# Why EchoSphere X?

Modern communication depends heavily on internet connectivity and wireless infrastructure. During disasters, remote expeditions, emergency medical situations, and isolated environments, those systems may not be available.

EchoSphere X investigates a different approach:

**Can digital information be reliably transmitted using only sound?**

Instead of relying on network protocols, the platform converts image data into precisely generated audio frequencies, allowing information to travel through ordinary speakers and microphones.

This makes the project valuable for experimentation in:

* Emergency communication
* Disaster response
* Remote healthcare
* Biomedical engineering
* Digital signal processing
* Embedded communication systems
* Educational demonstrations

---

# Features

## Image Transmission

* Encode images into acoustic MFSK signals
* Decode recorded MFSK audio back into images
* Adjustable transmission speed presets
* Configurable data rates
* Interactive upload interface

## Communication Controls

* Fast Mode
* Balanced Mode
* Reliable Mode
* Configurable symbol duration
* Adjustable transmission parameters

## Interactive Experience

* Modern responsive interface
* Real-time transmission statistics
* Live communication parameters
* Drag-and-drop image upload
* Biomedical-inspired UI

## Visualization

* Interactive 3D anatomy viewer
* Real-time communication metrics
* Acoustic transmission workflow

---

# How It Works

```text
Image
   │
   ▼
Image Processing
   │
   ▼
Binary Conversion
   │
   ▼
MFSK Modulation
   │
   ▼
Audio Signal Generation
   │
   ▼
Acoustic Transmission
   │
   ▼
Audio Reception
   │
   ▼
MFSK Demodulation
   │
   ▼
Binary Reconstruction
   │
   ▼
Recovered Image
```

---

# Applications

EchoSphere X has potential applications in several research and engineering domains.

### Biomedical Engineering

* Offline medical image transmission
* Remote healthcare communication
* Rural diagnostic support

### Communication Systems

* Acoustic data transmission
* Digital modulation research
* Signal processing education

### Disaster Response

* Infrastructure-independent communication
* Emergency field operations
* Remote rescue environments

### Research & Education

* Digital Signal Processing laboratories
* Telecommunications education
* Embedded systems research
* Communication protocol experimentation

---

# Technology Stack

## Frontend

* React
* TypeScript
* Tailwind CSS
* Vite

## Signal Processing

* Multiple Frequency Shift Keying (MFSK)
* Web Audio API
* Digital Signal Processing Concepts

## Visualization

* Three.js
* Interactive 3D Graphics

## Development

* JavaScript / TypeScript
* HTML5
* CSS3

---

# Current Capabilities

* Image upload
* Image-to-audio conversion
* Audio generation
* Adjustable transmission presets
* Interactive transmission controls
* Acoustic communication interface
* Modern responsive UI

---

# Planned Features

The following features are planned for future releases:

### Communication

* Reed–Solomon Forward Error Correction
* CRC verification
* Adaptive modulation
* Packet synchronization
* Packet interleaving
* Automatic packet recovery

### Signal Analysis

* Live FFT spectrum
* Spectrogram visualization
* Waterfall display
* Signal quality estimation
* Bit Error Rate (BER) analysis

### Biomedical Support

* Native DICOM support
* X-ray transmission
* CT image support
* MRI visualization
* Ultrasound compatibility

### Platform

* Desktop application
* Progressive Web App
* End-to-end encryption
* Multi-file transmission
* Streaming mode

---

# Repository Structure

```text
EchoSphere-X/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── encoder/
│   ├── decoder/
│   ├── modulation/
│   ├── audio/
│   ├── utils/
│   └── assets/
│
├── package.json
├── vite.config.ts
├── LICENSE
└── README.md
```

---

# Getting Started

## Clone the Repository

```bash
git clone https://github.com/your-username/EchoSphere-X.git
```

## Navigate to the Project

```bash
cd EchoSphere-X
```

## Install Dependencies

```bash
npm install
```

## Start the Development Server

```bash
npm run dev
```

Open your browser and visit:

```
http://localhost:5173
```

---

# Contributing

Contributions are welcome.

If you would like to improve EchoSphere X, you are encouraged to:

* Report bugs
* Suggest new features
* Improve documentation
* Optimize signal processing algorithms
* Enhance the user interface
* Submit pull requests

Please open an issue before making major architectural changes.

---

# License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

You are free to use, modify, and distribute this software under the terms of the GPL-3.0 license. Any derivative work distributed to others must also be released under the GPL-3.0.

For full license details, see the **LICENSE** file included in this repository.

---

# Author

**Tharun  Katikireddy**

Biomedical Engineering Student • Founder of **DiagnoSphereX**

Focused on Biomedical Engineering, Artificial Intelligence, Digital Signal Processing, Medical Technologies, and Human-Centered Innovation.

---

## Acknowledgements

This project was inspired by the principles of digital communications, signal processing, biomedical engineering, and open-source software development. EchoSphere X is developed as an experimental platform to explore innovative approaches to offline acoustic communication.
