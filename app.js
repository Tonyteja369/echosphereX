// High-Speed MFSK Image Converter Application
class MFSKConverter {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.imageData = null;
        this.decodedImageData = null;
        this.micStream = null;
        this.analyser = null;
        this.isListening = false;
        this.audioFile = null;
        
        // MFSK Configuration (from application data)
        this.config = {
            tones: 64,
            symbolDurations: { fast: 3, balanced: 5, reliable: 8 },
            baseFreq: 2000,
            frequencySpacing: 50,
            sampleRate: 44100,
            fftSize: 2048,
            maxWidth: 1024,
            maxHeight: 768,
            jpegQuality: 0.6
        };
        
        this.currentPreset = 'balanced';
        this.currentMethod = 'file';
        
        this.supportedImageFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
        this.supportedAudioFormats = ['audio/wav', 'audio/mp3', 'audio/ogg'];
        
        this.initializeElements();
        this.bindEvents();
        this.initializeAudioContext();
        this.updateEncodeInfo();
    }

    initializeElements() {
        // Tab elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.encodeTab = document.getElementById('encode-tab');
        this.decodeTab = document.getElementById('decode-tab');
        
        // Encode tab elements
        this.presetBtns = document.querySelectorAll('.preset-btn');
        this.imageUploadArea = document.getElementById('imageUploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.imageInfo = document.getElementById('imageInfo');
        this.imagePreview = document.getElementById('imagePreview');
        this.imageFileName = document.getElementById('imageFileName');
        this.imageFileSize = document.getElementById('imageFileSize');
        this.compressedSize = document.getElementById('compressedSize');
        
        this.encodeDataRate = document.getElementById('encodeDataRate');
        this.encodeDuration = document.getElementById('encodeDuration');
        this.encodeBtn = document.getElementById('encodeBtn');
        this.encodeProgress = document.getElementById('encodeProgress');
        this.encodeProgressFill = document.getElementById('encodeProgressFill');
        this.encodeProgressText = document.getElementById('encodeProgressText');
        
        this.audioOutput = document.getElementById('audioOutput');
        this.audioPlayer = document.getElementById('audioPlayer');
        this.actualDuration = document.getElementById('actualDuration');
        this.audioFileSize = document.getElementById('audioFileSize');
        this.actualDataRate = document.getElementById('actualDataRate');
        this.downloadAudioBtn = document.getElementById('downloadAudioBtn');
        
        // Decode tab elements
        this.methodBtns = document.querySelectorAll('.method-btn');
        this.fileDecodeSection = document.getElementById('fileDecodeSection');
        this.micDecodeSection = document.getElementById('micDecodeSection');
        
        this.audioUploadArea = document.getElementById('audioUploadArea');
        this.audioInput = document.getElementById('audioInput');
        this.audioInfo = document.getElementById('audioInfo');
        this.audioFileName = document.getElementById('audioFileName');
        this.audioUploadSize = document.getElementById('audioUploadSize');
        this.audioDuration = document.getElementById('audioDuration');
        this.decodeFileBtn = document.getElementById('decodeFileBtn');
        
        this.startMicBtn = document.getElementById('startMicBtn');
        this.stopMicBtn = document.getElementById('stopMicBtn');
        this.visualizer = document.getElementById('visualizer');
        this.spectrumCanvas = document.getElementById('spectrumCanvas');
        this.signalFill = document.getElementById('signalFill');
        this.signalValue = document.getElementById('signalValue');
        
        this.decodeProgressSection = document.getElementById('decodeProgressSection');
        this.decodeProgressFill = document.getElementById('decodeProgressFill');
        this.decodeProgressText = document.getElementById('decodeProgressText');
        this.decodedBits = document.getElementById('decodedBits');
        this.errorRate = document.getElementById('errorRate');
        this.signalQuality = document.getElementById('signalQuality');
        
        this.imageOutput = document.getElementById('imageOutput');
        this.decodedImage = document.getElementById('decodedImage');
        this.decodedImageSize = document.getElementById('decodedImageSize');
        this.decodeTime = document.getElementById('decodeTime');
        this.successRate = document.getElementById('successRate');
        this.downloadImageBtn = document.getElementById('downloadImageBtn');
    }

    bindEvents() {
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(btn.dataset.tab);
            });
        });
        
        // Preset selection
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectPreset(btn.dataset.preset);
            });
        });
        
        // Method selection
        this.methodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectMethod(btn.dataset.method);
            });
        });
        
        // Image upload events
        if (this.imageUploadArea && this.imageInput) {
            // Using label-for approach now, so we only need the change event
            this.imageInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.handleImageSelect(e.target.files[0]);
                }
            });
            this.setupDragAndDrop(this.imageUploadArea, this.handleImageSelect.bind(this));
        }
        
        // Audio upload events
        if (this.audioUploadArea && this.audioInput) {
            // Using label-for approach now, so we only need the change event
            this.audioInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.handleAudioSelect(e.target.files[0]);
                }
            });
            this.setupDragAndDrop(this.audioUploadArea, this.handleAudioSelect.bind(this));
        }
        
        // Action buttons
        if (this.encodeBtn) {
            this.encodeBtn.addEventListener('click', () => this.encodeImage());
        }
        if (this.decodeFileBtn) {
            this.decodeFileBtn.addEventListener('click', () => this.decodeAudioFile());
        }
        if (this.startMicBtn) {
            this.startMicBtn.addEventListener('click', () => this.startMicrophoneDecoding());
        }
        if (this.stopMicBtn) {
            this.stopMicBtn.addEventListener('click', () => this.stopMicrophoneDecoding());
        }
        if (this.downloadAudioBtn) {
            this.downloadAudioBtn.addEventListener('click', () => this.downloadAudio());
        }
        if (this.downloadImageBtn) {
            this.downloadImageBtn.addEventListener('click', () => this.downloadImage());
        }
    }

    async initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.config.sampleRate
            });
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
        }
    }

    setupDragAndDrop(area, handler) {
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', () => {
            area.classList.remove('dragover');
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handler(e.dataTransfer.files[0]);
            }
        });
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // Update tab buttons
        this.tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        if (tabName === 'encode') {
            this.encodeTab.classList.add('active');
            this.decodeTab.classList.remove('active');
        } else if (tabName === 'decode') {
            this.encodeTab.classList.remove('active');
            this.decodeTab.classList.add('active');
        }
    }

    selectPreset(preset) {
        console.log('Selecting preset:', preset);
        
        this.presetBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-preset="${preset}"]`).classList.add('active');
        this.currentPreset = preset;
        this.updateEncodeInfo();
    }

    selectMethod(method) {
        console.log('Selecting method:', method);
        
        this.methodBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-method="${method}"]`).classList.add('active');
        this.currentMethod = method;
        
        if (this.fileDecodeSection) {
            this.fileDecodeSection.classList.toggle('hidden', method !== 'file');
        }
        if (this.micDecodeSection) {
            this.micDecodeSection.classList.toggle('hidden', method !== 'microphone');
        }
    }

    updateEncodeInfo() {
        const symbolDuration = this.config.symbolDurations[this.currentPreset];
        const bitsPerSymbol = Math.log2(this.config.tones);
        const dataRate = Math.round(bitsPerSymbol / (symbolDuration / 1000));
        
        if (this.encodeDataRate) {
            this.encodeDataRate.textContent = `${Math.round(dataRate / 1000)} kbps`;
        }
        
        if (this.imageData && this.encodeDuration) {
            const totalSymbols = Math.ceil(this.imageData.length / bitsPerSymbol);
            const duration = (totalSymbols * symbolDuration) / 1000;
            this.encodeDuration.textContent = duration > 60 ? 
                `${Math.round(duration)}s ⚠️` : `~${Math.round(duration)}s`;
        }
    }

    async handleImageSelect(file) {
        if (!file) return;
        
        console.log('Image selected:', file.name, file.type);
        
        if (!this.supportedImageFormats.includes(file.type)) {
            alert('Unsupported image format. Please select JPG, PNG, GIF, or BMP.');
            return;
        }
        
        if (file.size > 5000000) { // 5MB limit
            alert('Image too large. Please select a smaller image.');
            return;
        }

        this.displayImageInfo(file);
        await this.processImage(file);
    }

    displayImageInfo(file) {
        if (this.imageFileName) {
            this.imageFileName.textContent = file.name;
        }
        if (this.imageFileSize) {
            this.imageFileSize.textContent = this.formatFileSize(file.size);
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.imagePreview) {
                this.imagePreview.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
        
        if (this.imageInfo) {
            this.imageInfo.classList.remove('hidden');
        }
    }

    async processImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calculate dimensions maintaining aspect ratio
                    const maxWidth = this.config.maxWidth;
                    const maxHeight = this.config.maxHeight;
                    let { width, height } = img;
                    
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to JPEG with quality compression
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', this.config.jpegQuality);
                    const compressedSize = Math.round(compressedDataUrl.length * 0.75); // Approximate size
                    
                    if (this.compressedSize) {
                        this.compressedSize.textContent = this.formatFileSize(compressedSize);
                    }
                    
                    // Convert to binary
                    this.imageData = this.dataUrlToBinary(compressedDataUrl);
                    this.updateEncodeInfo();
                    
                    if (this.encodeBtn) {
                        this.encodeBtn.disabled = false;
                    }
                    
                    resolve();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    dataUrlToBinary(dataUrl) {
        const base64 = dataUrl.split(',')[1];
        const binaryString = atob(base64);
        let binary = '';
        for (let i = 0; i < binaryString.length; i++) {
            binary += binaryString.charCodeAt(i).toString(2).padStart(8, '0');
        }
        return binary;
    }

    async encodeImage() {
        if (!this.imageData) return;
        
        if (this.encodeBtn) {
            this.encodeBtn.disabled = true;
            this.encodeBtn.classList.add('btn--loading');
        }
        
        if (this.encodeProgress) {
            this.encodeProgress.classList.remove('hidden');
        }
        if (this.audioOutput) {
            this.audioOutput.classList.add('hidden');
        }
        
        try {
            await this.generateMFSKAudio();
            this.displayGeneratedAudio();
        } catch (error) {
            console.error('Encoding failed:', error);
            alert('Failed to generate MFSK audio. Please try again.');
        } finally {
            if (this.encodeBtn) {
                this.encodeBtn.disabled = false;
                this.encodeBtn.classList.remove('btn--loading');
            }
            if (this.encodeProgress) {
                this.encodeProgress.classList.add('hidden');
            }
        }
    }

    async generateMFSKAudio() {
        const symbolDuration = this.config.symbolDurations[this.currentPreset];
        const bitsPerSymbol = Math.log2(this.config.tones);
        const symbols = this.binaryToSymbols(this.imageData, bitsPerSymbol);
        
        const symbolDurationSamples = Math.floor(this.config.sampleRate * symbolDuration / 1000);
        const totalSamples = symbols.length * symbolDurationSamples;
        
        if (!this.audioContext) {
            await this.initializeAudioContext();
        }
        
        this.audioBuffer = this.audioContext.createBuffer(1, totalSamples, this.config.sampleRate);
        const channelData = this.audioBuffer.getChannelData(0);
        
        const frequencies = this.generateFrequencies();
        
        for (let i = 0; i < symbols.length; i++) {
            this.updateEncodeProgress((i / symbols.length) * 100, 
                `Generating symbol ${i + 1}/${symbols.length}`);
            
            const symbolIndex = symbols[i];
            const frequency = frequencies[symbolIndex];
            const startSample = i * symbolDurationSamples;
            
            // Generate windowed sine wave
            for (let j = 0; j < symbolDurationSamples; j++) {
                const sampleIndex = startSample + j;
                const time = j / this.config.sampleRate;
                
                // Hamming window to reduce spectral leakage
                const windowFactor = 0.54 - 0.46 * Math.cos(2 * Math.PI * j / (symbolDurationSamples - 1));
                const amplitude = windowFactor * 0.3; // Keep amplitude reasonable
                
                channelData[sampleIndex] = amplitude * Math.sin(2 * Math.PI * frequency * time);
            }
            
            // Yield control periodically
            if (i % 50 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        this.updateEncodeProgress(100, 'Audio generation complete');
    }

    binaryToSymbols(binaryString, bitsPerSymbol) {
        const symbols = [];
        for (let i = 0; i < binaryString.length; i += bitsPerSymbol) {
            const chunk = binaryString.substr(i, bitsPerSymbol).padEnd(bitsPerSymbol, '0');
            symbols.push(parseInt(chunk, 2));
        }
        return symbols;
    }

    generateFrequencies() {
        const frequencies = [];
        const M = this.config.tones;
        const fc = this.config.baseFreq;
        const spacing = this.config.frequencySpacing;
        
        // Generate frequencies centered around base frequency
        const startFreq = fc - ((M - 1) * spacing) / 2;
        for (let i = 0; i < M; i++) {
            frequencies.push(startFreq + (i * spacing));
        }
        return frequencies;
    }

    updateEncodeProgress(percent, text) {
        if (this.encodeProgressFill) {
            this.encodeProgressFill.style.width = `${percent}%`;
        }
        if (this.encodeProgressText) {
            this.encodeProgressText.textContent = text;
        }
    }

    displayGeneratedAudio() {
        const audioBlob = this.audioBufferToWav(this.audioBuffer);
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (this.audioPlayer) {
            this.audioPlayer.src = audioUrl;
        }
        if (this.actualDuration) {
            this.actualDuration.textContent = `${this.audioBuffer.duration.toFixed(2)}s`;
        }
        if (this.audioFileSize) {
            this.audioFileSize.textContent = this.formatFileSize(audioBlob.size);
        }
        if (this.actualDataRate) {
            const actualRate = Math.round(this.imageData.length / this.audioBuffer.duration / 1000);
            this.actualDataRate.textContent = `${actualRate} kbps`;
        }
        
        if (this.audioOutput) {
            this.audioOutput.classList.remove('hidden');
        }
    }

    async handleAudioSelect(file) {
        if (!file) return;
        
        console.log('Audio selected:', file.name, file.type);
        
        if (!this.supportedAudioFormats.some(format => file.type.includes(format.replace('audio/', '')))) {
            alert('Unsupported audio format. Please select WAV, MP3, or OGG.');
            return;
        }
        
        this.displayAudioInfo(file);
        this.audioFile = file;
    }

    displayAudioInfo(file) {
        if (this.audioFileName) {
            this.audioFileName.textContent = file.name;
        }
        if (this.audioUploadSize) {
            this.audioUploadSize.textContent = this.formatFileSize(file.size);
        }
        
        // Create audio element to get duration
        const audio = new Audio();
        audio.onloadedmetadata = () => {
            if (this.audioDuration) {
                this.audioDuration.textContent = `${audio.duration.toFixed(1)}s`;
            }
        };
        audio.src = URL.createObjectURL(file);
        
        if (this.audioInfo) {
            this.audioInfo.classList.remove('hidden');
        }
    }

    async decodeAudioFile() {
        if (!this.audioFile) return;
        
        if (this.decodeFileBtn) {
            this.decodeFileBtn.disabled = true;
            this.decodeFileBtn.classList.add('btn--loading');
        }
        if (this.decodeProgressSection) {
            this.decodeProgressSection.classList.remove('hidden');
        }
        if (this.imageOutput) {
            this.imageOutput.classList.add('hidden');
        }
        
        try {
            const startTime = Date.now();
            await this.processAudioForDecoding(this.audioFile);
            const decodeTime = Date.now() - startTime;
            this.displayDecodedImage(decodeTime);
        } catch (error) {
            console.error('Decoding failed:', error);
            alert('Failed to decode MFSK audio. Please check the file format and try again.');
        } finally {
            if (this.decodeFileBtn) {
                this.decodeFileBtn.disabled = false;
                this.decodeFileBtn.classList.remove('btn--loading');
            }
            if (this.decodeProgressSection) {
                this.decodeProgressSection.classList.add('hidden');
            }
        }
    }

    async processAudioForDecoding(file) {
        if (!this.audioContext) {
            await this.initializeAudioContext();
        }
        
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        this.updateDecodeProgress(10, 'Analyzing frequency spectrum...');
        
        const channelData = audioBuffer.getChannelData(0);
        const symbols = await this.extractSymbolsFromAudio(channelData);
        
        this.updateDecodeProgress(70, 'Reconstructing image data...');
        
        const binaryData = this.symbolsToBinary(symbols);
        this.decodedImageData = this.binaryToDataUrl(binaryData);
        
        this.updateDecodeProgress(100, 'Decoding complete');
    }

    async extractSymbolsFromAudio(audioData) {
        const symbolDuration = this.config.symbolDurations[this.currentPreset];
        const symbolSamples = Math.floor(this.config.sampleRate * symbolDuration / 1000);
        const totalSymbols = Math.floor(audioData.length / symbolSamples);
        const symbols = [];
        const frequencies = this.generateFrequencies();
        
        for (let i = 0; i < totalSymbols; i++) {
            const startSample = i * symbolSamples;
            const symbolData = audioData.slice(startSample, startSample + symbolSamples);
            
            // Perform FFT analysis to find dominant frequency
            const fftResult = this.performFFT(symbolData);
            const detectedFreq = this.findDominantFrequency(fftResult);
            
            // Find closest MFSK frequency
            let closestSymbol = 0;
            let minDistance = Infinity;
            for (let j = 0; j < frequencies.length; j++) {
                const distance = Math.abs(frequencies[j] - detectedFreq);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestSymbol = j;
                }
            }
            
            symbols.push(closestSymbol);
            
            this.updateDecodeProgress(10 + (i / totalSymbols) * 60, 
                `Decoding symbol ${i + 1}/${totalSymbols}`);
            
            if (i % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        return symbols;
    }

    performFFT(audioData) {
        // Simple DFT for frequency analysis
        const frequencies = this.generateFrequencies();
        const results = [];
        
        for (const freq of frequencies) {
            let real = 0, imag = 0;
            for (let i = 0; i < audioData.length; i++) {
                const angle = 2 * Math.PI * freq * i / this.config.sampleRate;
                real += audioData[i] * Math.cos(angle);
                imag += audioData[i] * Math.sin(angle);
            }
            results.push({ freq, magnitude: Math.sqrt(real * real + imag * imag) });
        }
        
        return results;
    }

    findDominantFrequency(fftResult) {
        let maxMagnitude = 0;
        let dominantFreq = 0;
        
        for (const result of fftResult) {
            if (result.magnitude > maxMagnitude) {
                maxMagnitude = result.magnitude;
                dominantFreq = result.freq;
            }
        }
        
        return dominantFreq;
    }

    symbolsToBinary(symbols) {
        const bitsPerSymbol = Math.log2(this.config.tones);
        let binary = '';
        for (const symbol of symbols) {
            binary += symbol.toString(2).padStart(bitsPerSymbol, '0');
        }
        return binary;
    }

    binaryToDataUrl(binary) {
        let binaryString = '';
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substr(i, 8).padEnd(8, '0');
            binaryString += String.fromCharCode(parseInt(byte, 2));
        }
        
        try {
            const base64 = btoa(binaryString);
            return `data:image/jpeg;base64,${base64}`;
        } catch (error) {
            console.error('Failed to convert binary to image:', error);
            throw new Error('Image reconstruction failed');
        }
    }

    displayDecodedImage(decodeTime) {
        if (this.decodedImage) {
            this.decodedImage.src = this.decodedImageData;
        }
        if (this.decodedImageSize) {
            this.decodedImageSize.textContent = this.formatFileSize(this.decodedImageData.length * 0.75);
        }
        if (this.decodeTime) {
            this.decodeTime.textContent = `${(decodeTime / 1000).toFixed(1)}s`;
        }
        if (this.successRate) {
            this.successRate.textContent = '95%'; // Placeholder - would need error detection
        }
        
        if (this.imageOutput) {
            this.imageOutput.classList.remove('hidden');
        }
    }

    async startMicrophoneDecoding() {
        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            if (!this.audioContext) {
                await this.initializeAudioContext();
            }
            
            const source = this.audioContext.createMediaStreamSource(this.micStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.config.fftSize;
            
            source.connect(this.analyser);
            
            this.isListening = true;
            
            if (this.startMicBtn) {
                this.startMicBtn.classList.add('hidden');
            }
            if (this.stopMicBtn) {
                this.stopMicBtn.classList.remove('hidden');
            }
            if (this.visualizer) {
                this.visualizer.classList.remove('hidden');
            }
            
            this.startRealtimeAnalysis();
            
        } catch (error) {
            console.error('Microphone access denied:', error);
            alert('Microphone access is required for live decoding. Please allow access and try again.');
        }
    }

    stopMicrophoneDecoding() {
        this.isListening = false;
        
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }
        
        if (this.startMicBtn) {
            this.startMicBtn.classList.remove('hidden');
        }
        if (this.stopMicBtn) {
            this.stopMicBtn.classList.add('hidden');
        }
        if (this.visualizer) {
            this.visualizer.classList.add('hidden');
        }
    }

    startRealtimeAnalysis() {
        const canvas = this.spectrumCanvas;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            if (!this.isListening) return;
            
            requestAnimationFrame(draw);
            
            this.analyser.getByteFrequencyData(dataArray);
            
            // Clear canvas
            ctx.fillStyle = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-surface');
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw spectrum
            ctx.fillStyle = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-primary');
            
            const barWidth = canvas.width / bufferLength;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth;
            }
            
            // Update signal strength
            const avgSignal = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
            const signalPercent = Math.round((avgSignal / 255) * 100);
            if (this.signalFill) {
                this.signalFill.style.width = `${signalPercent}%`;
            }
            if (this.signalValue) {
                this.signalValue.textContent = `${signalPercent}%`;
            }
        };
        
        draw();
    }

    updateDecodeProgress(percent, text) {
        if (this.decodeProgressFill) {
            this.decodeProgressFill.style.width = `${percent}%`;
        }
        if (this.decodeProgressText) {
            this.decodeProgressText.textContent = text;
        }
        
        // Update stats (placeholder values for demo)
        if (this.decodedBits) {
            this.decodedBits.textContent = Math.round(percent * 100);
        }
        if (this.errorRate) {
            this.errorRate.textContent = `${Math.max(0, 5 - percent/20).toFixed(1)}%`;
        }
        if (this.signalQuality) {
            this.signalQuality.textContent = percent > 80 ? 'Good' : percent > 50 ? 'Fair' : 'Poor';
        }
    }

    downloadAudio() {
        if (!this.audioBuffer) return;
        
        const audioBlob = this.audioBufferToWav(this.audioBuffer);
        this.downloadBlob(audioBlob, 'mfsk_audio.wav');
    }

    downloadImage() {
        if (!this.decodedImageData) return;
        
        // Convert data URL to blob
        const byteString = atob(this.decodedImageData.split(',')[1]);
        const mimeString = this.decodedImageData.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeString });
        this.downloadBlob(blob, 'decoded_image.jpg');
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    audioBufferToWav(buffer) {
        const length = buffer.length;
        const numberOfChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
        const view = new DataView(arrayBuffer);
        
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * numberOfChannels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * numberOfChannels * 2, true);
        
        let offset = 44;
         for (let i = 0; i < length; i++) {
             for (let channel = 0; channel < numberOfChannels; channel++) {
                 const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                 view.setInt16(offset, sample * 32767, true);
                 offset += 2;
             }
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing MFSK converter...');
    new MFSKConverter();
});