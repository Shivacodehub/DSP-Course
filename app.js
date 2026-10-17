// Sidebar toggle for student portal
function toggleStudentSidebar() {
    const isMobile = window.innerWidth <= 1024;
    if (isMobile) {
        document.body.classList.toggle('sidebar-active');
    } else {
        document.body.classList.toggle('sidebar-collapsed');
    }
}

// Ensure math renders once KaTeX is loaded
document.addEventListener("DOMContentLoaded", () => {
    try {
        if (window.renderMathInElement) {
            window.renderMathInElement(document.body, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false },
                    { left: "\\(", right: "\\)", display: false },
                    { left: "\\[", right: "\\]", display: true }
                ]
            });
        }
    } catch (e) {
        console.error("KaTeX auto-render error:", e);
    }

    const initFuncs = [
        initAccordion,
        initADCBlockDiagram,
        initSamplingSimulator,
        initPeriodicitySimulator,
        initEvenOddSimulator,
        initEnergyPowerSimulator,
        initConvolutionSimulator,
        initLTIStabilitySimulator,
        initSystolicSimulator,
        initDTFTSimulator,
        initPhasorSimulator,
        initFrequencyResponseSimulator,
        initZTransformSimulator,
        initInverseZSimulator,
        initDFTSimulator,
        initDFTPropertiesSimulator,
        initComplexitySimulator,
        initFFTButterflySimulator,
        initDIFSimulator,
        initRadix4Simulator,
        initOverlapAddSimulator,
        initOverlapSaveSimulator,
        initQuantizationSimulator,
        initFreqSamplingSimulator,
        initIIRSimulator,
        initCascadeSimulator,
        initParallelSimulator,
        initLatticeSimulator,
        initFIRSpecificationsSimulator,
        initWindowingSimulator,
        initWindowingComparisonSimulator,
        initFrequencySamplingSimulator,
        initMovingAverageSimulator,
        initAnalogPrototypeSimulator,
        initImpulseInvarianceSimulator,
        initBilinearSimulator,
        initSpectralTransformationSimulator,
        initAdaptiveNoiseCancellationSimulator,
        initTabSwitching
    ];

    initFuncs.forEach(fn => {
        try {
            fn();
        } catch (e) {
            console.error(`Error in simulator initialization '${fn.name}':`, e);
        }
    });
});

// ============================================================================
// 1. Accordion Toggle
// ============================================================================
function initAccordion() {
    const headers = document.querySelectorAll(".accordion-header");
    headers.forEach(header => {
        header.addEventListener("click", () => {
            const accordion = header.parentElement;
            accordion.classList.toggle("open");
        });
    });
}

// ============================================================================
// 2. Interactive ADC Block Diagram
// ============================================================================
function initADCBlockDiagram() {
    const nodes = document.querySelectorAll(".diagram-node");
    const infoTitle = document.getElementById("diagram-info-title");
    const infoDesc = document.getElementById("diagram-info-desc");
    const canvas = document.getElementById("canvas-adc-waveform");
    const ctx = canvas.getContext("2d");

    // AAF Controls Elements
    const aafControls = document.getElementById("aaf-controls");
    const sliderAafR = document.getElementById("slider-aaf-r");
    const sliderAafC = document.getElementById("slider-aaf-c");
    const valAafR = document.getElementById("val-aaf-r");
    const valAafC = document.getElementById("val-aaf-c");
    const valAafFc = document.getElementById("val-aaf-fc");
    const valAafFn = document.getElementById("val-aaf-fn");
    const valAafStatus = document.getElementById("val-aaf-status");

    // S&H Controls Elements
    const shControls = document.getElementById("sh-controls");
    const sliderShRon = document.getElementById("slider-sh-ron");
    const sliderShChold = document.getElementById("slider-sh-chold");
    const valShRon = document.getElementById("val-sh-ron");
    const valShChold = document.getElementById("val-sh-chold");
    const valShTau = document.getElementById("val-sh-tau");
    const valShTacq = document.getElementById("val-sh-tacq");
    const valShTs = document.getElementById("val-sh-ts");
    const valShStatus = document.getElementById("val-sh-status");

    // Dynamic Quantizer Elements
    const quantizerControls = document.getElementById("quantizer-controls");
    const sliderBits = document.getElementById("slider-quantizer-bits");
    const valBits = document.getElementById("val-quantizer-bits");
    const valLevels = document.getElementById("val-quantizer-levels");
    const valStep = document.getElementById("val-quantizer-step");
    const valSqnr = document.getElementById("val-quantizer-sqnr");

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
        canvas.height = 180 * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const blockData = {
        aaf: {
            title: "Anti-Aliasing Filter (AAF)",
            desc: "The Anti-Aliasing Filter is a continuous-time (analog) low-pass filter. It attenuates frequencies higher than the folding frequency ($f_N = f_s/2$) to prevent aliasing. For a 1st-order RC filter, the cutoff frequency is $f_c = \\frac{1}{2\\pi R C}$. To prevent aliasing, we require $f_c \\le f_s/2 \\implies R C \\ge \\frac{1}{\\pi f_s}$.",
            draw: (w, h) => {
                ctx.clearRect(0, 0, w, h);
                drawGrid(ctx, w, h);

                const R = parseFloat(sliderAafR.value); // in kOhm
                const C = parseFloat(sliderAafC.value); // in uF
                const fc = 1 / (2 * Math.PI * R * 1e3 * C * 1e-6); // Hz
                const fs = parseFloat(document.getElementById("slider-fs").value);
                const fn = fs / 2;

                // Update display values
                valAafR.innerText = R + " kΩ";
                valAafC.innerText = C.toFixed(1) + " μF";
                valAafFc.innerText = fc.toFixed(1) + " Hz";
                valAafFn.innerText = fn.toFixed(1) + " Hz";

                const isSafe = fc <= fn;
                if (isSafe) {
                    valAafStatus.className = "status-pill success";
                    valAafStatus.innerHTML = "&bull; Safe Cutoff";
                } else {
                    valAafStatus.className = "status-pill danger";
                    valAafStatus.innerHTML = "&bull; Aliasing Danger";
                }

                // Draw input noisy signal + filtered signal (dampened noise depending on fc)
                // Noisy Input (Analog, dotted/faint)
                ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let x = 0; x < w; x++) {
                    const t = x / w * 4 * Math.PI;
                    const y = h/2 + 40 * Math.sin(t) + 12 * Math.sin(15 * t);
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Filtered output: noise amplitude depends on fc
                const noiseScale = Math.min(12, 12 * (fc / 10)); // simple visual scaling
                
                ctx.strokeStyle = "#0dd5c5";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                for (let x = 0; x < w; x++) {
                    const t = x / w * 4 * Math.PI;
                    // Filtered noise
                    const noise = noiseScale * Math.sin(15 * t) * (fc > fn ? 0.8 : 0.05);
                    const y = h/2 + 40 * Math.sin(t) + noise;
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Labels
                ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
                ctx.font = "11px Inter";
                ctx.fillText("Unfiltered Input (with noise)", 10, 20);
                ctx.fillStyle = "#0dd5c5";
                ctx.fillText("Filtered Output x_f(t)", 10, h - 10);
            }
        },
        sh: {
            title: "Sample & Hold (S&H) Circuit",
            desc: "The Sample & Hold circuit consists of a fast analog switch (MOSFET) and a hold capacitor $C_{hold}$. In <strong>Track Mode</strong>, the switch closes and the capacitor charges to the input voltage with a time constant $\\tau = R_{on} C_{hold}$. In <strong>Hold Mode</strong>, the switch opens, storing the voltage value for the ADC. The acquisition time $T_{acq} \\approx 7\\tau$ must be smaller than the tracking interval to charge to within 0.1% accuracy.",
            draw: (w, h) => {
                ctx.clearRect(0, 0, w, h);
                drawGrid(ctx, w, h);

                const Ron = parseFloat(sliderShRon.value);
                const Chold = parseFloat(sliderShChold.value); // in pF
                const tau = Ron * Chold * 1e-12; // seconds
                const Tacq = 7 * tau;
                const fs = parseFloat(document.getElementById("slider-fs").value);
                const Ts = 1 / fs;

                // Update display values
                valShRon.innerText = Ron + " Ω";
                valShChold.innerText = Chold + " pF";
                valShTau.innerText = tau < 1e-6 ? (tau*1e9).toFixed(1) + " ns" : (tau*1e6).toFixed(1) + " μs";
                valShTacq.innerText = Tacq < 1e-6 ? (Tacq*1e9).toFixed(1) + " ns" : (Tacq*1e6).toFixed(1) + " μs";
                valShTs.innerText = (Ts*1000).toFixed(1) + " ms";

                const isSafe = Tacq <= Ts / 2;
                if (isSafe) {
                    valShStatus.className = "status-pill success";
                    valShStatus.innerHTML = "&bull; Safe Tracking";
                } else {
                    valShStatus.className = "status-pill danger";
                    valShStatus.innerHTML = "&bull; Insufficient Charge Time";
                }

                // Draw S&H waveform showing tracking and holding stages
                ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
                ctx.setLineDash([4, 4]);
                ctx.lineWidth = 1.2;
                // Underlying input sine
                ctx.beginPath();
                for (let x = 0; x < w; x++) {
                    const t = x / w * 4 * Math.PI;
                    const y = h/2 + 40 * Math.sin(t);
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.setLineDash([]);

                // Draw S&H output waveform
                ctx.strokeStyle = "#6366f1";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                const numSamples = 25;
                let prevX = 0;
                let prevY = h/2;
                for (let i = 0; i < numSamples; i++) {
                    const x = (i / (numSamples - 1)) * (w - 40) + 20;
                    const t = (x - 20) / (w - 40) * 4 * Math.PI;
                    const targetY = h/2 + 40 * Math.sin(t);
                    
                    if (i === 0) {
                        ctx.moveTo(x, targetY);
                        prevY = targetY;
                    } else {
                        // Tracking phase: exponential charge from prevY to targetY
                        // If Tacq is too large, the capacitor doesn't reach targetY!
                        const ratio = Math.min(1.0, (Ts / 2) / (Tacq + 1e-15)); 
                        const reachedY = prevY + (targetY - prevY) * (1 - Math.exp(-3.5 * ratio));
                        
                        ctx.lineTo(x - (x - prevX)/2, reachedY); // tracking jump
                        ctx.lineTo(x, reachedY); // hold line
                        prevY = reachedY;
                    }
                    prevX = x;
                }
                ctx.stroke();

                ctx.fillStyle = "#6366f1";
                ctx.font = "11px Inter";
                ctx.fillText("Sample & Hold Circuit Output x[n]", 10, 20);
            }
        },
        quantizer: {
            title: "Quantizer & Coder (Discrete Amplitude, Discrete Time)",
            desc: "The Quantizer rounds each continuous sample amplitude to the nearest value from a finite set of pre-defined levels (quantization levels). A 3-bit quantizer has $2^3 = 8$ levels. The Coder then maps these levels to binary words (e.g., 010, 110), yielding the digital bitstream.",
            draw: (w, h) => {
                ctx.clearRect(0, 0, w, h);
                drawGrid(ctx, w, h);

                const B = parseInt(sliderBits.value);
                const levels = Math.pow(2, B);
                
                // Calculate display metrics
                const range = 4.0; // Volt peak-to-peak (-2 to +2V)
                const step = range / levels;
                const sqnr = 6.02 * B + 1.76;

                // Update controls display
                valBits.innerText = B + " bits";
                valLevels.innerText = levels;
                valStep.innerText = step.toFixed(3) + " V";
                valSqnr.innerText = sqnr.toFixed(2) + " dB";

                // Drawing horizontal quantization levels
                ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
                ctx.lineWidth = 1;
                for (let i = 0; i < levels; i++) {
                    const y = (i / (levels - 1)) * (h - 40) + 20;
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(w, y);
                    ctx.stroke();
                    
                    // Label levels (only show if levels <= 16 to avoid clutter)
                    if (levels <= 16) {
                        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                        ctx.font = "8px Fira Code";
                        const binary = (levels - 1 - i).toString(2).padStart(B, '0');
                        ctx.fillText(binary, w - 20 - 5 * B, y + 3);
                    }
                }

                // Sample Stems mapped to nearest level
                const numSamples = 25;
                ctx.strokeStyle = "#10b981";
                ctx.fillStyle = "#10b981";
                ctx.lineWidth = 2;
                for (let i = 0; i < numSamples; i++) {
                    const x = (i / (numSamples - 1)) * (w - 60) + 20;
                    const t = (x - 20) / (w - 60) * 4 * Math.PI;
                    const exactY = h/2 + 40 * Math.sin(t);
                    
                    // Find closest level
                    let minDiff = Infinity;
                    let quantizedY = exactY;
                    for (let j = 0; j < levels; j++) {
                        const lvlY = (j / (levels - 1)) * (h - 40) + 20;
                        const diff = Math.abs(exactY - lvlY);
                        if (diff < minDiff) {
                            minDiff = diff;
                            quantizedY = lvlY;
                        }
                    }

                    // Stem line
                    ctx.beginPath();
                    ctx.moveTo(x, h/2);
                    ctx.lineTo(x, quantizedY);
                    ctx.stroke();

                    // Stem dot
                    ctx.beginPath();
                    ctx.arc(x, quantizedY, 4, 0, 2 * Math.PI);
                    ctx.fill();
                }

                ctx.fillStyle = "#10b981";
                ctx.font = "11px Inter";
                ctx.fillText("Quantized Digital Sequence x_q[n] (" + B + "-bit)", 10, 20);
            }
        },
        dsp: {
            title: "Digital Processor (DSP)",
            desc: "The digital processor receives the discrete binary code sequence. It performs numerical operations such as convolution, addition, and scaling using digital hardware structures. It operates in pure numbers, making the filter immune to temperature drift and components aging.",
            draw: (w, h) => {
                ctx.clearRect(0, 0, w, h);
                drawGrid(ctx, w, h);

                const B = parseInt(sliderBits.value);
                const levels = Math.pow(2, B);

                // Draw digital bits array / code block representation
                ctx.fillStyle = "#8b5cf6";
                ctx.font = "10px Fira Code";
                const numSamples = 12;
                for (let i = 0; i < numSamples; i++) {
                    const x = (i / (numSamples - 1)) * (w - 80) + 20;
                    const t = (x - 20) / (w - 80) * 2.5 * Math.PI;
                    const val = Math.sin(t);
                    
                    // Normalize val from [-1, 1] to [0, levels-1]
                    const normVal = Math.round((val + 1) / 2 * (levels - 1));
                    const binVal = normVal.toString(2).padStart(B, '0');
                    
                    ctx.fillText("[" + binVal + "]", x, h/2 - 10);
                    ctx.fillRect(x + 2, h/2 + 2, 25, 4);
                }

                ctx.fillStyle = "#8b5cf6";
                ctx.font = "11px Inter";
                ctx.fillText("Binary processing in memory registers (" + B + "-bit words)", 10, 20);
            }
        }
    };

    function drawGrid(ctx, w, h) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1;
        // Horizontal middle line (origin)
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.lineTo(w, h/2);
        ctx.stroke();
    }

    // Add click listeners
    nodes.forEach(node => {
        node.addEventListener("click", () => {
            nodes.forEach(n => n.classList.remove("active-block"));
            node.classList.add("active-block");
            
            const key = node.dataset.block;
            const data = blockData[key];
            
            infoTitle.innerText = data.title;
            infoDesc.innerHTML = data.desc;
            
            // Re-render MathJax/KaTeX in description
            if (window.renderMathInElement) {
                window.renderMathInElement(infoDesc);
            }

            // Show/hide respective controls
            aafControls.style.display = (key === "aaf") ? "block" : "none";
            shControls.style.display = (key === "sh") ? "block" : "none";
            quantizerControls.style.display = (key === "quantizer") ? "block" : "none";
            
            // Redraw canvas
            const w = canvas.width / window.devicePixelRatio;
            const h = canvas.height / window.devicePixelRatio;
            data.draw(w, h);
        });
    });

    // Add slider listener for quantizer bits
    sliderBits.addEventListener("input", () => {
        const activeNode = document.querySelector(".diagram-node.active-block");
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;
        
        if (activeNode) {
            const key = activeNode.dataset.block;
            if (key === "quantizer") {
                blockData.quantizer.draw(w, h);
            } else if (key === "dsp") {
                blockData.dsp.draw(w, h);
            }
        }
    });

    // Add slider listeners for AAF
    [sliderAafR, sliderAafC].forEach(slider => {
        slider.addEventListener("input", () => {
            const activeNode = document.querySelector(".diagram-node.active-block");
            const w = canvas.width / window.devicePixelRatio;
            const h = canvas.height / window.devicePixelRatio;
            if (activeNode && activeNode.dataset.block === "aaf") {
                blockData.aaf.draw(w, h);
            }
        });
    });

    // Add slider listeners for S&H
    [sliderShRon, sliderShChold].forEach(slider => {
        slider.addEventListener("input", () => {
            const activeNode = document.querySelector(".diagram-node.active-block");
            const w = canvas.width / window.devicePixelRatio;
            const h = canvas.height / window.devicePixelRatio;
            if (activeNode && activeNode.dataset.block === "sh") {
                blockData.sh.draw(w, h);
            }
        });
    });

    // Draw initial state (AAF)
    const initialW = canvas.width / window.devicePixelRatio;
    const initialH = canvas.height / window.devicePixelRatio;
    blockData.aaf.draw(initialW, initialH);
}

// ====================================================================
// 3. Sampling, Nyquist Rate & Aliasing Simulator
// ============================================================================
function initSamplingSimulator() {
    const canvas = document.getElementById("canvas-sampling-plot");
    const ctx = canvas.getContext("2d");

    const sliderF1 = document.getElementById("slider-f1");
    const sliderF2 = document.getElementById("slider-f2");
    const sliderFs = document.getElementById("slider-fs");
    const toggleHf = document.getElementById("toggle-hf");
    const toggleAaf = document.getElementById("toggle-aaf");

    const valF1 = document.getElementById("val-f1");
    const valF2 = document.getElementById("val-f2");
    const valFs = document.getElementById("val-fs");
    const nyquistRateVal = document.getElementById("nyquist-rate-val");
    const statusPill = document.getElementById("sampling-status-pill");

    function resize() {
        canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
        canvas.height = 350 * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function getSignal(t, f1, f2, hfEnabled, aafEnabled) {
        // Base low-frequency signal
        let val = 1.0 * Math.sin(2 * Math.PI * f1 * t);
        
        // High frequency component
        if (hfEnabled) {
            // AAF dampens the high frequency if enabled
            // Assume filter cuts off perfectly at fs/2
            const fs = parseFloat(sliderFs.value);
            const cutoff = fs / 2;
            if (!aafEnabled || f2 < cutoff) {
                val += 0.5 * Math.cos(2 * Math.PI * f2 * t);
            }
        }
        return val;
    }

    function getReconstructedSignal(t, f1, f2, fs, hfEnabled, aafEnabled) {
        // Calculate aliased/folded frequencies
        // f_alias = | f - fs * round(f / fs) |
        const getAliasFreq = (f) => {
            const ratio = f / fs;
            const nearestInteger = Math.round(ratio);
            return Math.abs(f - fs * nearestInteger);
        };

        const f1_a = getAliasFreq(f1);
        let val = 1.0 * Math.sin(2 * Math.PI * f1_a * t);

        if (hfEnabled) {
            const cutoff = fs / 2;
            if (!aafEnabled || f2 < cutoff) {
                const f2_a = getAliasFreq(f2);
                
                // Keep phase matching (simplified, since cosine folding maps to cosine or sine)
                // In a real reconstruction, the folded component has a specific phase.
                // We model the aliased cosine as cos(2pi * f2_a * t)
                val += 0.5 * Math.cos(2 * Math.PI * f2_a * t);
            }
        }
        return val;
    }

    function draw() {
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;

        const f1 = parseFloat(sliderF1.value);
        const f2 = parseFloat(sliderF2.value);
        const fs = parseFloat(sliderFs.value);
        const hfEnabled = toggleHf.checked;
        const aafEnabled = toggleAaf.checked;

        // Update Labels
        valF1.innerText = `${f1} Hz`;
        valF2.innerText = `${f2} Hz`;
        valFs.innerText = `${fs} Hz`;

        // Calculate max active frequency in original signal
        let maxFreq = f1;
        if (hfEnabled) {
            maxFreq = Math.max(f1, f2);
        }

        // Determine Nyquist requirement & Aliasing status
        const nyquistRate = 2 * maxFreq;
        nyquistRateVal.innerText = `${nyquistRate.toFixed(1)} Hz`;

        // Is aliased?
        // Aliasing happens if sampling rate is less than or equal to 2 * max active frequency.
        // Wait, if AAF is enabled, the high frequency component f2 is cut off if f2 >= fs/2.
        // In that case, the maximum active frequency that actually reaches the sampler is just f1.
        // So:
        let actualMaxFreq = f1;
        if (hfEnabled) {
            const cutoff = fs / 2;
            if (!aafEnabled || f2 < cutoff) {
                actualMaxFreq = Math.max(f1, f2);
            }
        }

        const isAliased = fs <= 2 * actualMaxFreq;

        if (isAliased) {
            statusPill.className = "status-pill danger";
            statusPill.innerHTML = "<span>&bull; Aliasing Present</span>";
        } else {
            statusPill.className = "status-pill success";
            statusPill.innerHTML = "<span>&bull; Correctly Sampled</span>";
        }

        ctx.clearRect(0, 0, w, h);

        // Draw grids
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 1; i < 5; i++) {
            const x = (i / 5) * w;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        ctx.moveTo(0, h/2);
        ctx.lineTo(w, h/2);
        ctx.stroke();

        const duration = 1.5; // Draw 1.5 seconds of signal
        const scaleX = w / duration;
        const centerY = h / 2;
        const scaleY = 70; // 70px per volt

        // 1. Draw original analog signal x(t) or x_f(t)
        ctx.strokeStyle = "#00b4d8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const t = x / scaleX;
            const val = getSignal(t, f1, f2, hfEnabled, aafEnabled);
            const y = centerY - val * scaleY;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 2. Draw reconstructed signal (smooth curve in red)
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const t = x / scaleX;
            const val = getReconstructedSignal(t, f1, f2, fs, hfEnabled, aafEnabled);
            const y = centerY - val * scaleY;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset

        // 3. Draw sample stem markers
        const numSamples = Math.floor(fs * duration);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillStyle = "#ffffff";
        ctx.lineWidth = 1.5;

        for (let i = 0; i <= numSamples; i++) {
            const t = i / fs;
            const x = t * scaleX;
            if (x > w) break;

            const val = getSignal(t, f1, f2, hfEnabled, aafEnabled);
            const y = centerY - val * scaleY;

            // Draw stem
            ctx.beginPath();
            ctx.moveTo(x, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Draw dot
            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw Legend
        ctx.font = "11px Inter";
        
        ctx.fillStyle = "#00b4d8";
        ctx.fillRect(15, 15, 12, 6);
        ctx.fillText("Analog Input x_f(t)", 34, 21);

        ctx.fillStyle = "#ef4444";
        ctx.fillRect(15, 35, 12, 6);
        ctx.fillText("Reconstructed Signal y(t)", 34, 41);

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(21, 60, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText("Sample Points x[n]", 34, 63);
    }

    // Add listeners
    [sliderF1, sliderF2, sliderFs, toggleHf, toggleAaf].forEach(ctrl => {
        ctrl.addEventListener("input", draw);
    });

    draw();
}

// ============================================================================
// 4. Periodicity of DT Sinusoids
// ============================================================================
function initPeriodicitySimulator() {
    const canvas = document.getElementById("canvas-periodicity-plot");
    const ctx = canvas.getContext("2d");

    const sliderFreq = document.getElementById("slider-freq");
    const valFreq = document.getElementById("val-freq");
    const valOmega = document.getElementById("val-omega");
    const valRatioFraction = document.getElementById("val-ratio-fraction");
    const valIsRational = document.getElementById("val-is-rational");
    const valPeriod = document.getElementById("val-period");

    function resize() {
        canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
        canvas.height = 350 * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    // Helper to find the closest fraction to a decimal
    function getClosestFraction(decimal, maxDenominator = 40) {
        let bestNumerator = 0;
        let bestDenominator = 1;
        let minError = Infinity;

        for (let den = 1; den <= maxDenominator; den++) {
            const num = Math.round(decimal * den);
            const error = Math.abs(decimal - num / den);
            if (error < minError) {
                minError = error;
                bestNumerator = num;
                bestDenominator = den;
            }
        }
        return {
            num: bestNumerator,
            den: bestDenominator,
            error: minError
        };
    }

    function draw() {
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;

        const f = parseFloat(sliderFreq.value);
        const omega0 = 2 * Math.PI * f;

        // Labels
        valFreq.innerText = `${f.toFixed(3)}`;
        valOmega.innerText = `${(f * 2).toFixed(3)} \u03c0`;

        // Periodicity Analysis
        // Find fraction m / N equal to f
        const frac = getClosestFraction(f, 40);
        
        // Let's decide if it's "rational" enough to look periodic in our range
        // Threshold: error < 1e-4
        const isRational = frac.error < 0.001;

        if (isRational && frac.num > 0) {
            valRatioFraction.innerText = `${frac.num} / ${frac.den}`;
            valIsRational.className = "status-pill success";
            valIsRational.innerHTML = "&bull; Yes";
            valPeriod.innerText = `${frac.den} samples`;
        } else {
            valRatioFraction.innerText = `${f.toFixed(4)} (Irrational-like)`;
            valIsRational.className = "status-pill danger";
            valIsRational.innerHTML = "&bull; No";
            valPeriod.innerText = "Aperiodic (\u221e)";
        }

        ctx.clearRect(0, 0, w, h);

        // Draw axis grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.lineTo(w, h/2);
        ctx.stroke();

        const numStems = 32; // Plot 32 samples (n = 0 to 31)
        const margin = 30;
        const stepX = (w - 2 * margin) / (numStems - 1);
        const scaleY = 90;
        const centerY = h / 2;

        // 1. Draw continuous guide line (dashed)
        ctx.strokeStyle = "rgba(13, 213, 197, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let x = margin; x < w - margin; x++) {
            const nVal = (x - margin) / stepX;
            const val = Math.cos(2 * Math.PI * f * nVal);
            const y = centerY - val * scaleY;
            if (x === margin) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Draw DT stem points
        ctx.strokeStyle = "#0dd5c5";
        ctx.fillStyle = "#0dd5c5";
        ctx.lineWidth = 2.5;

        for (let n = 0; n < numStems; n++) {
            const x = margin + n * stepX;
            const val = Math.cos(2 * Math.PI * f * n);
            const y = centerY - val * scaleY;

            // Draw stem
            ctx.beginPath();
            ctx.moveTo(x, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Draw marker dot
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Label n indexes below the axis for selected samples
            if (n % 4 === 0 || n === numStems - 1) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                ctx.font = "9px Fira Code";
                ctx.textAlign = "center";
                ctx.fillText(`n=${n}`, x, centerY + 18);
            }
        }
    }

    sliderFreq.addEventListener("input", draw);
    draw();
}

// ============================================================================
// 5. Even & Odd Decomposition Simulator
// ============================================================================
function initEvenOddSimulator() {
    const selectSignal = document.getElementById("select-evenodd-signal");
    const canvases = {
        x: document.getElementById("canvas-evenodd-x"),
        xminus: document.getElementById("canvas-evenodd-xminus"),
        xe: document.getElementById("canvas-evenodd-xe"),
        xo: document.getElementById("canvas-evenodd-xo")
    };
    
    const ctxs = {
        x: canvases.x.getContext("2d"),
        xminus: canvases.xminus.getContext("2d"),
        xe: canvases.xe.getContext("2d"),
        xo: canvases.xo.getContext("2d")
    };

    function resize() {
        Object.keys(canvases).forEach(key => {
            const canvas = canvases[key];
            if (!canvas) return;
            canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
            canvas.height = 140 * window.devicePixelRatio;
            const ctx = ctxs[key];
            ctx.resetTransform();
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        });
    }
    resize();
    window.addEventListener("resize", resize);

    function getSignalValue(type, n) {
        switch (type) {
            case "causal-exp":
                return n >= 0 ? 2.0 * Math.pow(0.7, n) : 0.0;
            case "rect-pulse":
                return (n >= 0 && n <= 3) ? 2.0 : 0.0;
            case "even-cosine":
                return 2.0 * Math.cos(Math.PI * n / 4);
            case "odd-sine":
                return 2.0 * Math.sin(Math.PI * n / 4);
            default:
                return 0;
        }
    }

    function drawStemPlot(ctx, w, h, data, color) {
        ctx.clearRect(0, 0, w, h);
        
        // Draw axis
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.lineTo(w, h/2);
        ctx.stroke();

        const numPoints = 13; // n = -6 to 6
        const margin = 20;
        const stepX = (w - 2 * margin) / (numPoints - 1);
        const scaleY = 22; // px per volt
        const centerY = h/2;

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1.5;

        for (let idx = 0; idx < numPoints; idx++) {
            const n = idx - 6;
            const x = margin + idx * stepX;
            const val = data[idx];
            const y = centerY - val * scaleY;

            // Stem line
            ctx.beginPath();
            ctx.moveTo(x, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Dot
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();

            // Index label
            if (n % 2 === 0) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctx.font = "8px Fira Code";
                ctx.textAlign = "center";
                ctx.fillText(n.toString(), x, centerY + 12);
                ctx.fillStyle = color; // Reset
            }
        }
    }

    function draw() {
        const type = selectSignal.value;
        const nVals = Array.from({length: 13}, (_, i) => i - 6);
        
        const x_data = nVals.map(n => getSignalValue(type, n));
        const xminus_data = nVals.map(n => getSignalValue(type, -n));
        const xe_data = x_data.map((x, i) => (x + xminus_data[i]) / 2.0);
        const xo_data = x_data.map((x, i) => (x - xminus_data[i]) / 2.0);

        const w = canvases.x.width / window.devicePixelRatio;
        const h = canvases.x.height / window.devicePixelRatio;

        drawStemPlot(ctxs.x, w, h, x_data, "#6366f1");
        drawStemPlot(ctxs.xminus, w, h, xminus_data, "#8b5cf6");
        drawStemPlot(ctxs.xe, w, h, xe_data, "#10b981");
        drawStemPlot(ctxs.xo, w, h, xo_data, "#ef4444");
    }

    if (selectSignal) {
        selectSignal.addEventListener("change", draw);
        draw();
    }
}

// ============================================================================
// 6. Energy & Power Simulator
// ============================================================================
function initEnergyPowerSimulator() {
    const selectSignal = document.getElementById("select-energy-signal");
    const sliderAmp = document.getElementById("slider-energy-amp");
    const sliderParam = document.getElementById("slider-energy-param");
    
    const valAmp = document.getElementById("val-energy-amp");
    const valParam = document.getElementById("val-energy-param");
    const labelParam = document.getElementById("label-energy-param");
    const groupParam = document.getElementById("group-energy-param");
    
    const valE = document.getElementById("val-energy-E");
    const valP = document.getElementById("val-energy-P");
    const valClass = document.getElementById("val-energy-class");

    const canvasSig = document.getElementById("canvas-energy-sig");
    const canvasSquared = document.getElementById("canvas-energy-squared");
    
    if (!canvasSig || !canvasSquared) return;
    
    const ctxSig = canvasSig.getContext("2d");
    const ctxSquared = canvasSquared.getContext("2d");

    function resize() {
        [canvasSig, canvasSquared].forEach(canvas => {
            canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
            canvas.height = 150 * window.devicePixelRatio;
        });
        ctxSig.resetTransform();
        ctxSig.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctxSquared.resetTransform();
        ctxSquared.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    // Adjust control layout depending on signal selected
    function updateControlsLayout() {
        const sigType = selectSignal.value;
        if (sigType === "decay-exp") {
            groupParam.style.display = "block";
            labelParam.innerHTML = `Decay Factor (\\(a\\)): <span id="val-energy-param" class="control-val">${sliderParam.value}</span>`;
            sliderParam.min = "0.1";
            sliderParam.max = "0.95";
            sliderParam.step = "0.05";
            if (parseFloat(sliderParam.value) > 0.95 || parseFloat(sliderParam.value) < 0.1) {
                sliderParam.value = "0.70";
            }
        } else if (sigType === "pulse") {
            groupParam.style.display = "block";
            labelParam.innerHTML = `Pulse Length (\\(M\\)): <span id="val-energy-param" class="control-val">${Math.round(sliderParam.value)}</span>`;
            sliderParam.min = "1";
            sliderParam.max = "15";
            sliderParam.step = "1";
            if (parseFloat(sliderParam.value) > 15) {
                sliderParam.value = "6";
            }
        } else if (sigType === "sinusoid") {
            groupParam.style.display = "block";
            labelParam.innerHTML = `Frequency (\\(f\\)): <span id="val-energy-param" class="control-val">${parseFloat(sliderParam.value).toFixed(2)}</span>`;
            sliderParam.min = "0.05";
            sliderParam.max = "0.4";
            sliderParam.step = "0.05";
            if (parseFloat(sliderParam.value) > 0.4) {
                sliderParam.value = "0.10";
            }
        } else if (sigType === "step") {
            groupParam.style.display = "none";
        }
        
        // Render math in label
        if (window.renderMathInElement) {
            window.renderMathInElement(labelParam);
        }
    }

    function getSignalValue(type, n, A, param) {
        switch (type) {
            case "decay-exp":
                return n >= 0 ? A * Math.pow(param, n) : 0.0;
            case "pulse":
                return (n >= 0 && n < Math.round(param)) ? A : 0.0;
            case "sinusoid":
                return A * Math.cos(2 * Math.PI * param * n);
            case "step":
                return n >= 0 ? A : 0.0;
            default:
                return 0;
        }
    }

    function drawStems(ctx, w, h, data, color, isSquared) {
        ctx.clearRect(0, 0, w, h);
        // Draw grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.lineTo(w, h/2);
        ctx.stroke();

        const numPoints = 25; // n = -12 to 12
        const margin = 24;
        const stepX = (w - 2 * margin) / (numPoints - 1);
        const scaleY = isSquared ? 10 : 30; // Scale squared values slightly smaller to fit
        const centerY = h/2;

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1.5;

        for (let idx = 0; idx < numPoints; idx++) {
            const n = idx - 12;
            const x = margin + idx * stepX;
            const val = data[idx];
            const y = centerY - val * scaleY;

            // Stem line
            ctx.beginPath();
            ctx.moveTo(x, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Dot
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();

            // Labels
            if (n % 4 === 0) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctx.font = "8px Fira Code";
                ctx.textAlign = "center";
                ctx.fillText(n.toString(), x, centerY + 12);
                ctx.fillStyle = color;
            }
        }
    }

    function draw() {
        updateControlsLayout();

        const sigType = selectSignal.value;
        const A = parseFloat(sliderAmp.value);
        const param = parseFloat(sliderParam.value);

        valAmp.innerText = A.toFixed(1);
        const paramSpan = document.getElementById("val-energy-param");
        if (paramSpan) {
            if (sigType === "decay-exp") paramSpan.innerText = param.toFixed(2);
            else if (sigType === "pulse") paramSpan.innerText = Math.round(param);
            else if (sigType === "sinusoid") paramSpan.innerText = param.toFixed(2);
        }

        // Calculations
        let E_val = 0;
        let P_val = 0;
        let classText = "";
        let classClass = "";

        switch (sigType) {
            case "decay-exp":
                // Analytical: E = A^2 / (1 - a^2)
                E_val = (A*A) / (1.0 - param*param);
                P_val = 0.0;
                classText = "&bull; Energy Signal";
                classClass = "status-pill success";
                break;
            case "pulse":
                // E = A^2 * M
                E_val = A*A * Math.round(param);
                P_val = 0.0;
                classText = "&bull; Energy Signal";
                classClass = "status-pill success";
                break;
            case "sinusoid":
                // E = infinity, P = A^2 / 2
                E_val = Infinity;
                P_val = (A*A) / 2.0;
                classText = "&bull; Power Signal";
                classClass = "status-pill success";
                break;
            case "step":
                // E = infinity, P = A^2 / 2 (for single sided)
                E_val = Infinity;
                P_val = (A*A) / 2.0;
                classText = "&bull; Power Signal";
                classClass = "status-pill success";
                break;
        }

        // Update displays
        valE.innerText = E_val === Infinity ? "\u221e" : E_val.toFixed(2);
        valP.innerText = P_val.toFixed(2);
        valClass.className = "status-pill " + (sigType === "decay-exp" || sigType === "pulse" ? "success" : "success");
        valClass.innerHTML = classText;

        // Generate data for plotting (n = -12 to 12)
        const nVals = Array.from({length: 25}, (_, i) => i - 12);
        const sigData = nVals.map(n => getSignalValue(sigType, n, A, param));
        const squaredData = sigData.map(val => val * val);

        const w = canvasSig.width / window.devicePixelRatio;
        const h = canvasSig.height / window.devicePixelRatio;

        drawStems(ctxSig, w, h, sigData, "#0dd5c5", false);
        drawStems(ctxSquared, w, h, squaredData, "#6366f1", true);
    }

    // Add listeners
    selectSignal.addEventListener("change", draw);
    sliderAmp.addEventListener("input", draw);
    sliderParam.addEventListener("input", draw);

    draw();
}


// ============================================================================
// 7. Tab Switching Logic
// ============================================================================
function initTabSwitching() {
    const items = document.querySelectorAll(".lecture-item");
    const pages = {
        1: document.getElementById("l1-page"),
        2: document.getElementById("l2-page"),
        3: document.getElementById("l3-page"),
        4: document.getElementById("l4-page"),
        5: document.getElementById("l5-page"),
        6: document.getElementById("l6-page"),
        7: document.getElementById("l7-page"),
        8: document.getElementById("l8-page"),
        9: document.getElementById("l9-page"),
        10: document.getElementById("l10-page"),
        11: document.getElementById("l11-page"),
        12: document.getElementById("l12-page"),
        13: document.getElementById("l13-page"),
        14: document.getElementById("l14-page"),
        15: document.getElementById("l15-page"),
        16: document.getElementById("l16-page"),
        17: document.getElementById("l17-page"),
        18: document.getElementById("l18-page"),
        19: document.getElementById("l19-page"),
        20: document.getElementById("l20-page"),
        21: document.getElementById("l21-page"),
        22: document.getElementById("l22-page"),
        23: document.getElementById("l23-page"),
        24: document.getElementById("l24-page"),
        25: document.getElementById("l25-page"),
        26: document.getElementById("l26-page")
    };
    const title = document.getElementById("current-lecture-title");
    const subtitle = document.getElementById("current-lecture-subtitle");
    const btnPdf = document.getElementById("btn-download-pdf");

    const lectureInfo = {
        1: {
            title: "Lecture 1: Course Introduction & DT Signals",
            subtitle: "Unit I: Basic Elements of DSP & recommended duration: 40 minutes",
            pdf: "lecture_01.pdf?v=2"
        },
        2: {
            title: "Lecture 2: LTI Systems, Convolution, Stability & Difference Equations",
            subtitle: "Unit I: Basic Elements of DSP & recommended duration: 40 minutes",
            pdf: "lecture_02.pdf?v=2"
        },
        3: {
            title: "Lecture 3: The Discrete-Time Fourier Transform (DTFT)",
            subtitle: "Unit I: Basic Elements of DSP & recommended duration: 40 minutes",
            pdf: "lecture_03.pdf?v=2"
        },
        4: {
            title: "Lecture 4: Frequency Response, Magnitude/Phase & Group Delay",
            subtitle: "Unit I: Basic Elements of DSP & recommended duration: 40 minutes",
            pdf: "lecture_04.pdf?v=2"
        },
        5: {
            title: "Lecture 5: Z-Transform, ROC & Common Pairs",
            subtitle: "Unit I: Basic Elements of DSP & recommended duration: 40 minutes",
            pdf: "lecture_05.pdf?v=2"
        },
        6: {
            title: "Lecture 6: Inverse Z-Transform & Stability Analysis",
            subtitle: "Unit I: Basic Elements of DSP & recommended duration: 40 minutes",
            pdf: "lecture_06.pdf?v=2"
        },
        7: {
            title: "Lecture 7: The Discrete Fourier Transform (DFT) & Matrix Formulation",
            subtitle: "Unit I: Basic Elements of DSP & recommended duration: 40 minutes",
            pdf: "lecture_07.pdf?v=2"
        },
        8: {
            title: "Lecture 8: Properties of the DFT & Circular Convolution",
            subtitle: "Unit II: Fast Fourier Transforms & recommended duration: 40 minutes",
            pdf: "lecture_08.pdf?v=2"
        },
        9: {
            title: "Lecture 9: Direct DFT Computational Complexity & FFT Motivation",
            subtitle: "Unit II: Fast Fourier Transforms & recommended duration: 40 minutes",
            pdf: "lecture_09.pdf?v=2"
        },
        10: {
            title: "Lecture 10: Radix-2 Decimation-in-Time FFT & Bit Reversal",
            subtitle: "Unit II: Fast Fourier Transforms & recommended duration: 40 minutes",
            pdf: "lecture_10.pdf?v=2"
        },
        11: {
            title: "Lecture 11: Radix-2 Decimation-in-Frequency FFT & DIT/DIF Comparison",
            subtitle: "Unit II: Fast Fourier Transforms & recommended duration: 40 minutes",
            pdf: "lecture_11.pdf?v=2"
        },
        12: {
            title: "Lecture 12: Radix-4 FFT Algorithm & Computational Complexity",
            subtitle: "Unit II: Fast Fourier Transforms & recommended duration: 40 minutes",
            pdf: "lecture_12.pdf?v=2"
        },
        13: {
            title: "Lecture 13: Linear Filtering of Long Sequences — Overlap-Add Method",
            subtitle: "Unit II: Fast Fourier Transforms & recommended duration: 40 minutes",
            pdf: "lecture_13.pdf?v=2"
        },
        14: {
            title: "Lecture 14: Linear Filtering of Long Sequences — Overlap-Save Method",
            subtitle: "Unit II: Fast Fourier Transforms & recommended duration: 40 minutes",
            pdf: "lecture_14.pdf?v=2"
        },
        15: {
            title: "Lecture 15: Digital Filter Realization Basics & FIR Direct/Cascade Forms",
            subtitle: "Unit III: Digital Filter Synthesis / Structures & recommended duration: 40 minutes",
            pdf: "lecture_15.pdf?v=2"
        },
        16: {
            title: "Lecture 16: Linear-Phase FIR realization & Frequency-Sampling Structure",
            subtitle: "Unit III: Digital Filter Synthesis / Structures & recommended duration: 40 minutes",
            pdf: "lecture_16.pdf?v=2"
        },
        17: {
            title: "Lecture 17: IIR Filter Realization — Direct Forms I, II & Transposed Forms",
            subtitle: "Unit III: Digital Filter Synthesis / Structures & recommended duration: 40 minutes",
            pdf: "lecture_17.pdf?v=2"
        },
        18: {
            title: "Lecture 18: IIR Cascade Realization & Pole-Zero Pairing",
            subtitle: "Unit III: Digital Filter Synthesis / Structures & recommended duration: 40 minutes",
            pdf: "lecture_18.pdf?v=2"
        },
        19: {
            title: "Lecture 19: IIR Parallel Realization",
            subtitle: "Unit III: Digital Filter Synthesis / Structures & recommended duration: 40 minutes",
            pdf: "lecture_19.pdf?v=2"
        },
        20: {
            title: "Lecture 20: Lattice and Lattice-Ladder Structures & Finite Word-Length Effects",
            subtitle: "Unit III: Digital Filter Synthesis / Structures & recommended duration: 40 minutes",
            pdf: "lecture_20.pdf?v=2"
        },
        21: {
            title: "Lecture 21: Linear-Phase FIR Filters, Characteristics, Zeros & Moving Average Filters",
            subtitle: "Unit IV: Digital Filter Design & recommended duration: 40 minutes",
            pdf: "lecture_21_student.pdf?v=2"
        },
        22: {
            title: "Lecture 22: Design of FIR Filters Using the Windowing Method",
            subtitle: "Unit IV: Digital Filter Design & recommended duration: 40 minutes",
            pdf: "lecture_22_student.pdf?v=2"
        },
        23: {
            title: "Lecture 23: Design of FIR Filters Using Frequency Sampling",
            subtitle: "Unit IV: Digital Filter Design & recommended duration: 40 minutes",
            pdf: "lecture_23_student.pdf?v=2"
        },
        24: {
            title: "Lecture 24: Design of IIR Filters from Analog Filters — Impulse Invariance",
            subtitle: "Unit IV: Digital Filter Design & recommended duration: 40 minutes",
            pdf: "lecture_24_student.pdf?v=2"
        },
        25: {
            title: "Lecture 25: Design of IIR Filters — Bilinear Transformation & Matched Z-Transform",
            subtitle: "Unit IV: Digital Filter Design & recommended duration: 40 minutes",
            pdf: "lecture_25_student.pdf?v=2"
        },
        26: {
            title: "Lecture 26: Equalization, Noise Cancellation & Adaptive FIR Filters",
            subtitle: "Unit IV: Digital Filter Design & recommended duration: 40 minutes",
            pdf: "lecture_26_student.pdf?v=2"
        }
    };

    items.forEach(item => {
        item.addEventListener("click", () => {
            if (item.classList.contains("locked")) return;

            items.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const num = parseInt(item.dataset.lecture);
            
            // Show/hide pages
            Object.keys(pages).forEach(key => {
                if (pages[key]) {
                    pages[key].style.display = (parseInt(key) === num) ? "block" : "none";
                }
            });

            // Update header details
            if (lectureInfo[num] && title && subtitle && btnPdf) {
                title.innerText = lectureInfo[num].title;
                subtitle.innerText = lectureInfo[num].subtitle;
                btnPdf.href = lectureInfo[num].pdf;
            }

            // Force resize trigger to redraw canvases on the newly active page
            window.dispatchEvent(new Event('resize'));

            // Auto-close sidebar on mobile after selecting a lecture
            if (window.innerWidth <= 1024) {
                document.body.classList.remove('sidebar-active');
            }
        });
    });
}

// ============================================================================
// 8. Discrete Convolution Simulator (Lecture 2)
// ============================================================================
function initConvolutionSimulator() {
    const selectX = document.getElementById("select-conv-x");
    const selectH = document.getElementById("select-conv-h");
    const sliderN = document.getElementById("slider-conv-n");
    
    const valN = document.getElementById("val-conv-n");
    const valCalc = document.getElementById("val-conv-calc");
    
    const canvasSignals = document.getElementById("canvas-conv-signals");
    const canvasResult = document.getElementById("canvas-conv-result");
    
    if (!canvasSignals || !canvasResult) return;
    
    const ctxSig = canvasSignals.getContext("2d");
    const ctxRes = canvasResult.getContext("2d");

    function resize() {
        canvasSignals.width = canvasSignals.parentElement.clientWidth * window.devicePixelRatio;
        canvasSignals.height = 180 * window.devicePixelRatio;
        canvasResult.width = canvasResult.parentElement.clientWidth * window.devicePixelRatio;
        canvasResult.height = 150 * window.devicePixelRatio;
        
        ctxSig.resetTransform();
        ctxSig.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctxRes.resetTransform();
        ctxRes.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function getX(k) {
        const type = selectX.value;
        if (type === "rect") {
            return (k >= 0 && k <= 4) ? 1.0 : 0.0;
        } else if (type === "step") {
            return (k >= 0 && k <= 7) ? 1.0 : 0.0;
        } else if (type === "ramp") {
            return (k >= 0 && k <= 5) ? k * 0.4 : 0.0; // scale factor to fit
        } else if (type === "decay_sig") {
            return (k >= 0 && k <= 10) ? Math.pow(0.5, k) : 0.0;
        } else if (type === "cosine_sig") {
            return (k >= 0 && k <= 10) ? Math.cos(0.2 * Math.PI * k) : 0.0;
        }
        return 0;
    }

    function getH(k) {
        const type = selectH.value;
        if (type === "decay") {
            return (k >= 0 && k <= 4) ? Math.pow(0.8, k) : 0.0;
        } else if (type === "rect") {
            return (k >= 0 && k <= 2) ? 1.0 : 0.0;
        } else if (type === "impulse") {
            return (k === 0) ? 1.0 : 0.0;
        } else if (type === "highpass") {
            return (k === 0) ? 1.0 : (k === 1) ? -1.0 : 0.0;
        } else if (type === "triangle") {
            return (k === 0 || k === 2) ? 1.0 : (k === 1) ? 2.0 : 0.0;
        } else if (type === "oscillating") {
            return (k >= 0 && k <= 8) ? Math.pow(0.7, k) * Math.cos(0.3 * Math.PI * k) : 0.0;
        }
        return 0;
    }

    function draw() {
        const n = parseInt(sliderN.value);
        valN.innerText = n;

        const wSig = canvasSignals.width / window.devicePixelRatio;
        const hSig = canvasSignals.height / window.devicePixelRatio;
        const wRes = canvasResult.width / window.devicePixelRatio;
        const hRes = canvasResult.height / window.devicePixelRatio;

        // Calculations
        // k ranges from -6 to 14
        const kMin = -6;
        const kMax = 14;
        const numPoints = kMax - kMin + 1;
        
        const x_vals = [];
        const h_shifted_vals = [];
        const products = [];
        let runningSum = 0;

        for (let k = kMin; k <= kMax; k++) {
            const xk = getX(k);
            const h_shifted = getH(n - k); // h[n-k]
            const prod = xk * h_shifted;
            
            x_vals.push(xk);
            h_shifted_vals.push(h_shifted);
            products.push(prod);
            runningSum += prod;
        }

        // Generate full output y[m] for plotting guide
        // y starts at -6, ends at 14
        const y_data = [];
        for (let m = -4; m <= 12; m++) {
            let sum = 0;
            for (let k = -6; k <= 14; k++) {
                sum += getX(k) * getH(m - k);
            }
            y_data.push(sum);
        }

        // Draw Canvas 1: x[k] and h[n-k]
        ctxSig.clearRect(0, 0, wSig, hSig);
        // Draw grid
        ctxSig.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctxSig.lineWidth = 1;
        ctxSig.beginPath();
        ctxSig.moveTo(0, hSig/2 + 20);
        ctxSig.lineTo(wSig, hSig/2 + 20);
        ctxSig.stroke();

        const margin = 24;
        const stepX = (wSig - 2 * margin) / (numPoints - 1);
        const centerY = hSig / 2 + 20;
        const scaleY = 35;

        // Highlight overlap regions
        ctxSig.fillStyle = "rgba(16, 185, 129, 0.1)";
        for (let idx = 0; idx < numPoints; idx++) {
            if (products[idx] > 0) {
                const x = margin + idx * stepX;
                ctxSig.fillRect(x - stepX/2, 10, stepX, hSig - 20);
            }
        }

        for (let idx = 0; idx < numPoints; idx++) {
            const k = kMin + idx;
            const x = margin + idx * stepX;
            const xk = x_vals[idx];
            const hnk = h_shifted_vals[idx];

            // 1. Draw x[k] stem (blue, slightly offset left)
            if (xk !== 0) {
                ctxSig.strokeStyle = "#00b4d8";
                ctxSig.lineWidth = 1.5;
                ctxSig.beginPath();
                ctxSig.moveTo(x - 2, centerY);
                ctxSig.lineTo(x - 2, centerY - xk * scaleY);
                ctxSig.stroke();
                
                ctxSig.fillStyle = "#00b4d8";
                ctxSig.beginPath();
                ctxSig.arc(x - 2, centerY - xk * scaleY, 2.5, 0, 2 * Math.PI);
                ctxSig.fill();
            }

            // 2. Draw h[n-k] stem (purple/red, slightly offset right)
            if (hnk !== 0) {
                ctxSig.strokeStyle = "#8b5cf6";
                ctxSig.lineWidth = 1.5;
                ctxSig.beginPath();
                ctxSig.moveTo(x + 2, centerY);
                ctxSig.lineTo(x + 2, centerY - hnk * scaleY);
                ctxSig.stroke();
                
                ctxSig.fillStyle = "#8b5cf6";
                ctxSig.beginPath();
                ctxSig.arc(x + 2, centerY - hnk * scaleY, 2.5, 0, 2 * Math.PI);
                ctxSig.fill();
            }

            // Draw index text below axis
            if (k % 2 === 0) {
                ctxSig.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctxSig.font = "8px Fira Code";
                ctxSig.textAlign = "center";
                ctxSig.fillText(k.toString(), x, centerY + 12);
            }
        }

        // Draw Legend for Canvas 1
        ctxSig.font = "9px Inter";
        ctxSig.fillStyle = "#00b4d8";
        ctxSig.fillRect(15, 12, 10, 5);
        ctxSig.fillText("Input x[k]", 30, 17);

        ctxSig.fillStyle = "#8b5cf6";
        ctxSig.fillRect(100, 12, 10, 5);
        ctxSig.fillText(`Folded & Shifted h[${n}-k]`, 115, 17);


        // Draw Canvas 2: Convolution output y[n]
        ctxRes.clearRect(0, 0, wRes, hRes);
        // Draw grid
        ctxRes.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctxRes.lineWidth = 1;
        ctxRes.beginPath();
        ctxRes.moveTo(0, hRes - 20);
        ctxRes.lineTo(wRes, hRes - 20);
        ctxRes.stroke();

        const numResPoints = 17; // -4 to 12
        const stepXRes = (wRes - 2 * margin) / (numResPoints - 1);
        const scaleYRes = 25;
        const centerYRes = hRes - 20;

        // Draw faded entire curve
        ctxRes.strokeStyle = "rgba(239, 68, 68, 0.15)";
        ctxRes.setLineDash([3, 2]);
        ctxRes.beginPath();
        for (let idx = 0; idx < numResPoints; idx++) {
            const x = margin + idx * stepXRes;
            const y = centerYRes - y_data[idx] * scaleYRes;
            if (idx === 0) ctxRes.moveTo(x, y); else ctxRes.lineTo(x, y);
        }
        ctxRes.stroke();
        ctxRes.setLineDash([]);

        // Draw stems up to index n
        ctxRes.strokeStyle = "#ef4444";
        ctxRes.fillStyle = "#ef4444";
        ctxRes.lineWidth = 2;
        for (let idx = 0; idx < numResPoints; idx++) {
            const m = idx - 4;
            if (m > n) break; // only draw up to current n

            const x = margin + idx * stepXRes;
            const val = y_data[idx];
            const y = centerYRes - val * scaleYRes;

            // Stem line
            ctxRes.beginPath();
            ctxRes.moveTo(x, centerYRes);
            ctxRes.lineTo(x, y);
            ctxRes.stroke();

            // Dot
            ctxRes.beginPath();
            ctxRes.arc(x, y, 3, 0, 2 * Math.PI);
            ctxRes.fill();

            // Highlight active current stem
            if (m === n) {
                ctxRes.strokeStyle = "#ffffff";
                ctxRes.beginPath();
                ctxRes.arc(x, y, 5, 0, 2 * Math.PI);
                ctxRes.stroke();
                ctxRes.strokeStyle = "#ef4444"; // reset
            }
        }

        // Draw index text below axis for output
        for (let idx = 0; idx < numResPoints; idx++) {
            const m = idx - 4;
            const x = margin + idx * stepXRes;
            if (m % 2 === 0) {
                ctxRes.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctxRes.font = "8px Fira Code";
                ctxRes.textAlign = "center";
                ctxRes.fillText(m.toString(), x, centerYRes + 12);
            }
        }

        // Create calculation description text
        let terms = [];
        let exactSum = 0;
        for (let idx = 0; idx < numPoints; idx++) {
            const k = kMin + idx;
            const xk = x_vals[idx];
            const hnk = h_shifted_vals[idx];
            if (xk * hnk !== 0) {
                terms.push(`${xk.toFixed(1)} * ${hnk.toFixed(2)}`);
                exactSum += xk * hnk;
            }
        }

        if (terms.length === 0) {
            valCalc.innerText = `y[${n}] = 0 (No overlap)`;
        } else {
            valCalc.innerText = `y[${n}] = ` + terms.join(" + ") + ` = ${exactSum.toFixed(2)}`;
        }
    }

    [selectX, selectH, sliderN].forEach(ctrl => {
        ctrl.addEventListener("input", draw);
    });

    draw();
}

// ============================================================================
// 9. LTI System Stability & Difference Equations Simulator (Lecture 2)
// ============================================================================
function initLTIStabilitySimulator() {
    const sliderA1 = document.getElementById("slider-lti-a1");
    const sliderB0 = document.getElementById("slider-lti-b0");
    const sliderB1 = document.getElementById("slider-lti-b1");
    const selectLtiX = document.getElementById("select-lti-x");
    
    const valA1 = document.getElementById("val-lti-a1");
    const valB0 = document.getElementById("val-lti-b0");
    const valB1 = document.getElementById("val-lti-b1");
    
    const valEq = document.getElementById("val-lti-eq");
    const valPole = document.getElementById("val-lti-pole");
    const valSum = document.getElementById("val-lti-sum");
    const valStatus = document.getElementById("val-lti-status");
    
    const canvas = document.getElementById("canvas-lti-impulse");
    
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
        canvas.height = 320 * window.devicePixelRatio;
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const a1 = parseFloat(sliderA1.value);
        const b0 = parseFloat(sliderB0.value);
        const b1 = parseFloat(sliderB1.value);

        valA1.innerText = a1.toFixed(2);
        valB0.innerText = b0.toFixed(1);
        valB1.innerText = b1.toFixed(1);

        // Update Equation Text
        const sign_a1 = -a1 >= 0 ? "+" : "";
        const sign_b1 = b1 >= 0 ? "+" : "";
        valEq.innerText = `y[n] = ${sign_a1}${(-a1).toFixed(2)}y[n-1] + ${b0.toFixed(1)}x[n] ${sign_b1}${b1.toFixed(1)}x[n-1]`;

        // Input excitation sequence helper
        const inputType = selectLtiX ? selectLtiX.value : "impulse";
        function getLtiX(m) {
            if (m < 0) return 0.0;
            if (inputType === "impulse") {
                return (m === 0) ? 1.0 : 0.0;
            } else if (inputType === "step") {
                return 1.0;
            } else if (inputType === "sine") {
                return Math.cos(0.15 * Math.PI * m);
            }
            return 0.0;
        }

        // Calculate absolute sum of impulse response h[n] to evaluate stability
        let prev_imp = 0;
        let sumAbs = 0;
        for (let n = 0; n <= 40; n++) { // check more terms for stability sum
            const x_n = (n === 0) ? 1.0 : 0.0;
            const x_minus_1 = (n === 1) ? 1.0 : 0.0;
            const hn_imp = -a1 * prev_imp + b0 * x_n + b1 * x_minus_1;
            sumAbs += Math.abs(hn_imp);
            prev_imp = hn_imp;
        }

        // Calculate actual system output response y[n] to the selected excitation x[n]
        const h_vals = [];
        let prev_y = 0;
        for (let n = 0; n <= 20; n++) {
            const x_n = getLtiX(n);
            const x_minus_1 = getLtiX(n - 1);
            const yn = -a1 * prev_y + b0 * x_n + b1 * x_minus_1;
            h_vals.push(yn);
            prev_y = yn;
        }

        // Pole of the first-order system is z = -a1
        const pole = -a1;
        valPole.innerText = pole.toFixed(2);

        const isStable = Math.abs(pole) < 1.0;
        valSum.innerText = isStable ? sumAbs.toFixed(3) : "\u221e (diverges)";

        if (isStable) {
            valStatus.className = "status-pill success";
            valStatus.innerHTML = "&bull; Stable System";
        } else {
            valStatus.className = "status-pill danger";
            valStatus.innerHTML = "&bull; Unstable System";
        }

        // Draw Canvas Stems
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        // Draw axis grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.lineTo(w, h/2);
        ctx.stroke();

        const numStems = 21;
        const margin = 20;
        const stepX = (w - 2 * margin) / (numStems - 1);
        const centerY = h/2;

        // Auto-scale Y based on maximum absolute value in h_vals to prevent clipping when unstable
        let maxAbs = Math.max(...h_vals.map(Math.abs));
        if (maxAbs < 1.0) maxAbs = 1.0;
        const scaleY = (h/2 - 30) / maxAbs; // dynamic scale

        ctx.strokeStyle = isStable ? "#10b981" : "#ef4444";
        ctx.fillStyle = isStable ? "#10b981" : "#ef4444";
        ctx.lineWidth = 2;

        for (let n = 0; n < numStems; n++) {
            const x = margin + n * stepX;
            const val = h_vals[n];
            const y = centerY - val * scaleY;

            // Stem line
            ctx.beginPath();
            ctx.moveTo(x, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Dot
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();

            // Index labels below axis
            if (n % 2 === 0) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctx.font = "8px Fira Code";
                ctx.textAlign = "center";
                ctx.fillText(`n=${n}`, x, centerY + 12);
            }
        }
    }

    [sliderA1, sliderB0, sliderB1, selectLtiX].forEach(ctrl => {
        if (ctrl) ctrl.addEventListener("input", draw);
    });

    draw();
}

// ============================================================================
// 9.5. Parallel Systolic Convolution (MAC Cascade) Simulator (Lecture 2)
// ============================================================================
function initSystolicSimulator() {
    const btnStep = document.getElementById("btn-systolic-step");
    const btnReset = document.getElementById("btn-systolic-reset");
    const valClk = document.getElementById("val-systolic-clk");
    const valIn = document.getElementById("val-systolic-in");
    const valOut = document.getElementById("val-systolic-out");

    const r0El = document.getElementById("systolic-r0");
    const r1El = document.getElementById("systolic-r1");
    const r2El = document.getElementById("systolic-r2");

    const p0El = document.getElementById("systolic-p0");
    const p1El = document.getElementById("systolic-p1");
    const p2El = document.getElementById("systolic-p2");

    const canvas = document.getElementById("canvas-systolic-conv");

    if (!btnStep || !canvas) return;

    const ctx = canvas.getContext("2d");

    // Systolic hardware state variables
    const H = [1, 2, 1]; // filter coefficients: h[0]=1, h[1]=2, h[2]=1
    const X = [1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0]; // input sequence
    let R = [0, 0, 0]; // registers R0, R1, R2
    let clk = 0;
    let Y_log = []; // records outputs at each cycle
    let X_log = []; // records input at each cycle

    function resize() {
        canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
        canvas.height = 110 * window.devicePixelRatio;
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function resetPipeline() {
        R = [0, 0, 0];
        clk = 0;
        Y_log = [];
        X_log = [];
        updateUI(0, 0);
        draw();
    }

    function stepClock() {
        if (clk >= X.length) {
            // cycle loop back
            R = [0, 0, 0];
            clk = 0;
            Y_log = [];
            X_log = [];
        }

        const x_in = X[clk];
        
        // Multiplier products
        const p0 = x_in * H[0];
        const p1 = x_in * H[1];
        const p2 = x_in * H[2];

        // Register updates (Parallel state transitions)
        const next_R0 = R[1] + p0;
        const next_R1 = R[2] + p1;
        const next_R2 = p2;

        R[0] = next_R0;
        R[1] = next_R1;
        R[2] = next_R2;

        const y_out = R[0];
        Y_log.push(y_out);
        X_log.push(x_in);

        clk++;
        updateUI(x_in, y_out, p0, p1, p2);
        draw();
    }

    function updateUI(x_in, y_out, p0=0, p1=0, p2=0) {
        valClk.innerText = clk;
        valIn.innerText = x_in.toFixed(1);
        valOut.innerText = y_out.toFixed(1);

        r0El.innerText = R[0].toFixed(1);
        r1El.innerText = R[1].toFixed(1);
        r2El.innerText = R[2].toFixed(1);

        p0El.innerText = p0.toFixed(1);
        p1El.innerText = p1.toFixed(1);
        p2El.innerText = p2.toFixed(1);
    }

    function draw() {
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        // draw axes
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.lineTo(w, h/2);
        ctx.stroke();

        const maxPoints = X.length;
        const margin = 20;
        const step = (w - 2*margin) / (maxPoints - 1);
        const centerY = h/2;

        // Draw input sequence (faded blue dots)
        ctx.strokeStyle = "rgba(13, 213, 197, 0.25)";
        ctx.fillStyle = "rgba(13, 213, 197, 0.25)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < maxPoints; i++) {
            const x = margin + i * step;
            const val = X[i];
            const y = centerY - val * 15;
            ctx.beginPath();
            ctx.moveTo(x, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, 2*Math.PI);
            ctx.fill();
        }

        // Draw generated output sequence (solid red stems)
        ctx.strokeStyle = "#ef4444";
        ctx.fillStyle = "#ef4444";
        ctx.lineWidth = 2.5;
        for (let i = 0; i < Y_log.length; i++) {
            const x = margin + i * step;
            const val = Y_log[i];
            const y = centerY - val * 15;
            ctx.beginPath();
            ctx.moveTo(x, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2*Math.PI);
            ctx.fill();

            // Label output values above stems
            ctx.fillStyle = "#ffffff";
            ctx.font = "8px Fira Code";
            ctx.textAlign = "center";
            ctx.fillText(val.toString(), x, y - 6);
            ctx.fillStyle = "#ef4444";
        }

        // Label clock/ticks on bottom
        for (let i = 0; i < maxPoints; i++) {
            const x = margin + i * step;
            ctx.fillStyle = i < clk ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)";
            ctx.font = "7px Fira Code";
            ctx.textAlign = "center";
            ctx.fillText("n=" + i, x, h - 4);
        }
    }

    btnStep.addEventListener("click", stepClock);
    btnReset.addEventListener("click", resetPipeline);

    // Initial state draw
    updateUI(0, 0);
    draw();
}

// ============================================================================
// 10. Discrete-Time Fourier Transform (DTFT) Visualizer (Lecture 3)
// ============================================================================
function initDTFTSimulator() {
    const selectSig = document.getElementById("select-dtft-sig");
    const sliderParam = document.getElementById("slider-dtft-param");
    const valParam = document.getElementById("val-dtft-param");
    const labelParam = document.getElementById("label-dtft-param");
    const sliderShift = document.getElementById("slider-dtft-shift");
    const valShift = document.getElementById("val-dtft-shift");
    const sliderMod = document.getElementById("slider-dtft-mod");
    const valMod = document.getElementById("val-dtft-mod");
    const valFormula = document.getElementById("val-dtft-formula");
    
    const canvasTime = document.getElementById("canvas-dtft-time");
    const canvasMag = document.getElementById("canvas-dtft-mag");
    const canvasPhase = document.getElementById("canvas-dtft-phase");
    
    if (!canvasTime || !canvasMag || !canvasPhase) return;
    
    const ctxTime = canvasTime.getContext("2d");
    const ctxMag = canvasMag.getContext("2d");
    const ctxPhase = canvasPhase.getContext("2d");

    function resize() {
        canvasTime.width = canvasTime.parentElement.clientWidth * window.devicePixelRatio;
        canvasTime.height = 120 * window.devicePixelRatio;
        canvasMag.width = canvasMag.parentElement.clientWidth * window.devicePixelRatio;
        canvasMag.height = 130 * window.devicePixelRatio;
        canvasPhase.width = canvasPhase.parentElement.clientWidth * window.devicePixelRatio;
        canvasPhase.height = 120 * window.devicePixelRatio;
        
        ctxTime.resetTransform();
        ctxTime.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctxMag.resetTransform();
        ctxMag.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctxPhase.resetTransform();
        ctxPhase.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function updateControlsLayout() {
        const type = selectSig.value;
        if (type === "rect" || type === "sine_burst") {
            labelParam.innerHTML = `Pulse Width (M): <span id="val-dtft-param" class="control-val">${sliderParam.value}</span>`;
            sliderParam.min = 2;
            sliderParam.max = 10;
            sliderParam.step = 1;
        } else if (type === "decay" || type === "double_decay") {
            labelParam.innerHTML = `Decay Factor (a): <span id="val-dtft-param" class="control-val">${parseFloat(sliderParam.value).toFixed(2)}</span>`;
            if (parseFloat(sliderParam.value) > 0.95 || parseFloat(sliderParam.value) < -0.95) {
                sliderParam.value = 0.70;
            }
            sliderParam.min = -0.90;
            sliderParam.max = 0.90;
            sliderParam.step = 0.05;
        } else if (type === "dual" || type === "triangular") {
            labelParam.innerHTML = `Param (n0/M): <span id="val-dtft-param" class="control-val">${sliderParam.value}</span>`;
            sliderParam.min = 1;
            sliderParam.max = 6;
            sliderParam.step = 1;
        } else if (type === "dc") {
            labelParam.innerHTML = `Signal Level: <span id="val-dtft-param" class="control-val">${parseFloat(sliderParam.value).toFixed(1)}</span>`;
            sliderParam.min = 0.2;
            sliderParam.max = 1.5;
            sliderParam.step = 0.1;
        }
    }

    function draw() {
        updateControlsLayout();

        const type = selectSig.value;
        const param = parseFloat(sliderParam.value);
        const nd = parseInt(sliderShift.value);
        const w0 = sliderMod ? parseFloat(sliderMod.value) : 0.0;
        
        valShift.innerText = nd;
        if (valMod) valMod.innerText = w0.toFixed(2);

        const wTime = canvasTime.width / window.devicePixelRatio;
        const hTime = canvasTime.height / window.devicePixelRatio;
        const wMag = canvasMag.width / window.devicePixelRatio;
        const hMag = canvasMag.height / window.devicePixelRatio;
        const wPhase = canvasPhase.width / window.devicePixelRatio;
        const hPhase = canvasPhase.height / window.devicePixelRatio;

        // Generate Time Domain Signal x[n] for n = -6 to 14
        const nMin = -6;
        const nMax = 14;
        const numSamples = nMax - nMin + 1;
        const x_vals = new Array(numSamples).fill(0);

        for (let idx = 0; idx < numSamples; idx++) {
            const n = nMin + idx;
            if (type === "rect") {
                if (n >= nd && n < nd + param) {
                    x_vals[idx] = 1.0;
                }
            } else if (type === "decay") {
                if (n >= nd) {
                    if (n - nd < 12) {
                        x_vals[idx] = Math.pow(param, n - nd);
                    }
                }
            } else if (type === "dual") {
                if (n === nd || n === nd + param) {
                    x_vals[idx] = 1.0;
                }
            } else if (type === "triangular") {
                if (n >= nd - param && n <= nd + param) {
                    x_vals[idx] = 1.0 - Math.abs(n - nd) / (param + 1);
                }
            } else if (type === "sine_burst") {
                if (n >= nd && n < nd + param) {
                    x_vals[idx] = Math.cos(0.25 * Math.PI * (n - nd));
                }
            } else if (type === "double_decay") {
                if (Math.abs(n - nd) < 10) {
                    x_vals[idx] = Math.pow(Math.abs(param), Math.abs(n - nd));
                }
            } else if (type === "dc") {
                if (n >= nd - 6 && n <= nd + 6) {
                    x_vals[idx] = param;
                }
            }
        }

        // Apply Frequency Modulation: x[n] = x[n] * cos(w0 * n)
        if (w0 > 0.0) {
            for (let idx = 0; idx < numSamples; idx++) {
                const n = nMin + idx;
                x_vals[idx] *= Math.cos(w0 * n);
            }
        }

        // Analytical formulas print
        if (type === "rect") {
            valFormula.innerText = `X(e^{j\u03c9}) = [sin(\u03c9 \u22c5 ${param}/2) / sin(\u03c9/2)] \u22c5 e^{-j\u03c9 (${((param-1)/2 + nd).toFixed(1)})}`;
        } else if (type === "decay") {
            valFormula.innerText = `X(e^{j\u03c9}) = [1 / (1 - ${param.toFixed(2)}e^{-j\u03c9})] \u22c5 e^{-j\u03c9 ${nd}}`;
        } else if (type === "dual") {
            valFormula.innerText = `X(e^{j\u03c9}) = [1 + e^{-j\u03c9 ${param}}] \u22c5 e^{-j\u03c9 ${nd}}\n             = 2 cos(\u03c9 \u22c5 ${(param/2).toFixed(1)}) \u22c5 e^{-j\u03c9 (${(nd + param/2).toFixed(1)})}`;
        } else if (type === "triangular") {
            valFormula.innerText = `X(e^{j\u03c9}) \u2248 [sin(\u03c9 \u22c5 ${param}/2) / sin(\u03c9/2)]\u00b2 \u22c5 e^{-j\u03c9 ${nd}} (Triangle spectrum)`;
        } else {
            valFormula.innerText = `Modulated / Custom Signal Response (numerical evaluation shown in plots below)`;
        }

        // Draw Canvas 1: Time Domain Stems
        ctxTime.clearRect(0, 0, wTime, hTime);
        ctxTime.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctxTime.lineWidth = 1;
        ctxTime.beginPath();
        ctxTime.moveTo(0, hTime/2 + 10);
        ctxTime.lineTo(wTime, hTime/2 + 10);
        ctxTime.stroke();

        const margin = 20;
        const stepX = (wTime - 2 * margin) / (numSamples - 1);
        const centerY = hTime/2 + 10;
        const scaleY = 30;

        ctxTime.strokeStyle = "#0dd5c5";
        ctxTime.fillStyle = "#0dd5c5";
        ctxTime.lineWidth = 2;

        for (let idx = 0; idx < numSamples; idx++) {
            const n = nMin + idx;
            const x = margin + idx * stepX;
            const val = x_vals[idx];
            const y = centerY - val * scaleY;

            ctxTime.beginPath();
            ctxTime.moveTo(x, centerY);
            ctxTime.lineTo(x, y);
            ctxTime.stroke();

            ctxTime.beginPath();
            ctxTime.arc(x, y, 3, 0, 2 * Math.PI);
            ctxTime.fill();

            if (n % 2 === 0) {
                ctxTime.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctxTime.font = "8px Fira Code";
                ctxTime.textAlign = "center";
                ctxTime.fillText(n.toString(), x, centerY + 12);
                ctxTime.fillStyle = "#0dd5c5";
            }
        }

        // Calculate Numerical DTFT: evaluate X(e^{jw}) at 120 points for w in [-pi, pi]
        const numFreqPoints = 120;
        const magData = [];
        const phaseData = [];

        for (let i = 0; i < numFreqPoints; i++) {
            const w = -Math.PI + (i / (numFreqPoints - 1)) * 2 * Math.PI;
            
            let real = 0;
            let imag = 0;
            for (let idx = 0; idx < numSamples; idx++) {
                const n = nMin + idx;
                const val = x_vals[idx];
                if (val !== 0) {
                    real += val * Math.cos(w * n);
                    imag -= val * Math.sin(w * n);
                }
            }

            const mag = Math.sqrt(real * real + imag * imag);
            let phase = Math.atan2(imag, real);
            
            magData.push(mag);
            phaseData.push(phase);
        }

        // Draw Canvas 2: Magnitude Spectrum
        ctxMag.clearRect(0, 0, wMag, hMag);
        ctxMag.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctxMag.lineWidth = 1;
        const x_minus_pi = margin;
        const x_zero = wMag / 2;
        const x_plus_pi = wMag - margin;

        ctxMag.beginPath();
        ctxMag.moveTo(x_minus_pi, 0); ctxMag.lineTo(x_minus_pi, hMag);
        ctxMag.moveTo(x_zero, 0); ctxMag.lineTo(x_zero, hMag);
        ctxMag.moveTo(x_plus_pi, 0); ctxMag.lineTo(x_plus_pi, hMag);
        ctxMag.stroke();

        let maxMag = Math.max(...magData);
        if (maxMag < 1.0) maxMag = 1.0;
        const scaleMag = (hMag - 25) / maxMag;

        ctxMag.strokeStyle = "#8b5cf6";
        ctxMag.lineWidth = 2.5;
        ctxMag.beginPath();
        for (let i = 0; i < numFreqPoints; i++) {
            const x = margin + (i / (numFreqPoints - 1)) * (wMag - 2 * margin);
            const y = hMag - 15 - magData[i] * scaleMag;
            if (i === 0) ctxMag.moveTo(x, y); else ctxMag.lineTo(x, y);
        }
        ctxMag.stroke();

        ctxMag.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctxMag.font = "8px Fira Code";
        ctxMag.textAlign = "center";
        ctxMag.fillText("-\u03c0", x_minus_pi, hMag - 4);
        ctxMag.fillText("0", x_zero, hMag - 4);
        ctxMag.fillText("\u03c0", x_plus_pi, hMag - 4);

        // Draw Canvas 3: Phase Spectrum
        ctxPhase.clearRect(0, 0, wPhase, hPhase);
        ctxPhase.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctxPhase.lineWidth = 1;
        ctxPhase.beginPath();
        ctxPhase.moveTo(0, hPhase / 2);
        ctxPhase.lineTo(wPhase, hPhase / 2);
        ctxPhase.moveTo(x_minus_pi, 0); ctxPhase.lineTo(x_minus_pi, hPhase);
        ctxPhase.moveTo(x_zero, 0); ctxPhase.lineTo(x_zero, hPhase);
        ctxPhase.moveTo(x_plus_pi, 0); ctxPhase.lineTo(x_plus_pi, hPhase);
        ctxPhase.stroke();

        ctxPhase.strokeStyle = "#ef4444";
        ctxPhase.lineWidth = 2;
        const scalePhase = (hPhase / 2 - 15) / Math.PI;
        
        ctxPhase.beginPath();
        for (let i = 0; i < numFreqPoints; i++) {
            const x = margin + (i / (numFreqPoints - 1)) * (wPhase - 2 * margin);
            const y = hPhase / 2 - phaseData[i] * scalePhase;
            if (i === 0) ctxPhase.moveTo(x, y); else ctxPhase.lineTo(x, y);
        }
        ctxPhase.stroke();

        ctxPhase.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctxPhase.font = "8px Fira Code";
        ctxPhase.textAlign = "center";
        ctxPhase.fillText("-\u03c0", x_minus_pi, hPhase - 4);
        ctxPhase.fillText("0", x_zero, hPhase - 4);
        ctxPhase.fillText("\u03c0", x_plus_pi, hPhase - 4);
    }

    [selectSig, sliderParam, sliderShift, sliderMod].forEach(ctrl => {
        if (ctrl) ctrl.addEventListener("input", draw);
    });

    draw();
}

// ============================================================================
// 10.5. Phasor Rotations & Waveform Generation Simulator (Lecture 3)
// ============================================================================
function initPhasorSimulator() {
    const selectMode = document.getElementById("select-phasor-mode");
    const sliderW1 = document.getElementById("slider-phasor-w1");
    const valW1 = document.getElementById("val-phasor-w1");
    const sliderP1 = document.getElementById("slider-phasor-p1");
    const valP1 = document.getElementById("val-phasor-p1");
    
    const groupCircle2 = document.getElementById("group-phasor-circle2");
    const sliderW2 = document.getElementById("slider-phasor-w2");
    const valW2 = document.getElementById("val-phasor-w2");

    const btnPlay = document.getElementById("btn-phasor-play");
    const btnReset = document.getElementById("btn-phasor-reset");

    const canvasCircle = document.getElementById("canvas-phasor-circle");
    const canvasWave = document.getElementById("canvas-phasor-wave");

    if (!canvasCircle || !canvasWave) return;

    const ctxCircle = canvasCircle.getContext("2d");
    const ctxWave = canvasWave.getContext("2d");

    let running = true;
    let n = 0;
    let waveHistory = []; // stores { real, imag }
    const maxHistory = 100;
    let animationId = null;

    function resize() {
        canvasCircle.width = canvasCircle.parentElement.clientWidth * window.devicePixelRatio;
        canvasCircle.height = 210 * window.devicePixelRatio;
        canvasWave.width = canvasWave.parentElement.clientWidth * window.devicePixelRatio;
        canvasWave.height = 210 * window.devicePixelRatio;

        ctxCircle.resetTransform();
        ctxCircle.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctxWave.resetTransform();
        ctxWave.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function updateLayout() {
        const mode = selectMode.value;
        if (mode === "superposition") {
            groupCircle2.style.display = "block";
        } else {
            groupCircle2.style.display = "none";
        }

        valW1.innerText = parseFloat(sliderW1.value).toFixed(2);
        valP1.innerText = parseFloat(sliderP1.value).toFixed(2);
        valW2.innerText = parseFloat(sliderW2.value).toFixed(2);
    }

    function draw() {
        updateLayout();
        
        const wCircle = canvasCircle.width / window.devicePixelRatio;
        const hCircle = canvasCircle.height / window.devicePixelRatio;
        const wWave = canvasWave.width / window.devicePixelRatio;
        const hWave = canvasWave.height / window.devicePixelRatio;

        const mode = selectMode.value;
        const w1 = parseFloat(sliderW1.value);
        const p1 = parseFloat(sliderP1.value);
        const w2 = parseFloat(sliderW2.value);

        // --- 1. Calculate Positions ---
        const r1 = 55; // Radius of first circle
        const r2 = 30; // Radius of second circle

        const theta1 = w1 * n + p1;
        const x1 = r1 * Math.cos(theta1);
        const y1 = r1 * Math.sin(theta1);

        let xTotal = x1;
        let yTotal = y1;
        let x2 = 0;
        let y2 = 0;

        if (mode === "counter") {
            const theta2 = -w1 * n - p1;
            x2 = r1 * Math.cos(theta2);
            y2 = r1 * Math.sin(theta2);
            xTotal = x1 + x2;
            yTotal = y1 + y2;
        } else if (mode === "superposition") {
            const theta2 = w2 * n;
            x2 = r2 * Math.cos(theta2);
            y2 = r2 * Math.sin(theta2);
            xTotal = x1 + x2;
            yTotal = y1 + y2;
        }

        if (running) {
            waveHistory.push({
                real1: x1,
                imag1: y1,
                realTotal: xTotal,
                imagTotal: yTotal
            });
            if (waveHistory.length > maxHistory) {
                waveHistory.shift();
            }
        }

        // --- 2. Draw Circle Canvas (Complex Plane) ---
        ctxCircle.clearRect(0, 0, wCircle, hCircle);
        const cx = wCircle / 2;
        const cy = hCircle / 2;

        // Draw axes
        ctxCircle.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctxCircle.lineWidth = 1;
        ctxCircle.beginPath();
        ctxCircle.moveTo(0, cy); ctxCircle.lineTo(wCircle, cy);
        ctxCircle.moveTo(cx, 0); ctxCircle.lineTo(cx, hCircle);
        ctxCircle.stroke();

        // Draw first circle
        ctxCircle.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctxCircle.beginPath();
        ctxCircle.arc(cx, cy, r1, 0, 2 * Math.PI);
        ctxCircle.stroke();

        // Draw phasor 1 (green)
        ctxCircle.strokeStyle = "#10b981";
        ctxCircle.fillStyle = "#10b981";
        ctxCircle.lineWidth = 2.5;
        ctxCircle.beginPath();
        ctxCircle.moveTo(cx, cy);
        ctxCircle.lineTo(cx + x1, cy - y1);
        ctxCircle.stroke();
        // Dot at tip
        ctxCircle.beginPath();
        ctxCircle.arc(cx + x1, cy - y1, 4, 0, 2 * Math.PI);
        ctxCircle.fill();

        if (mode === "counter") {
            // Draw counter phasor (faint green/blue)
            ctxCircle.strokeStyle = "rgba(16, 185, 129, 0.4)";
            ctxCircle.fillStyle = "rgba(16, 185, 129, 0.4)";
            ctxCircle.beginPath();
            ctxCircle.moveTo(cx, cy);
            ctxCircle.lineTo(cx + x2, cy - y2);
            ctxCircle.stroke();
            ctxCircle.beginPath();
            ctxCircle.arc(cx + x2, cy - y2, 3, 0, 2 * Math.PI);
            ctxCircle.fill();

            // Draw sum vector (orange)
            ctxCircle.strokeStyle = "#f97316";
            ctxCircle.fillStyle = "#f97316";
            ctxCircle.lineWidth = 3;
            ctxCircle.beginPath();
            ctxCircle.moveTo(cx, cy);
            ctxCircle.lineTo(cx + xTotal, cy - yTotal);
            ctxCircle.stroke();
            ctxCircle.beginPath();
            ctxCircle.arc(cx + xTotal, cy - yTotal, 5, 0, 2 * Math.PI);
            ctxCircle.fill();

            // Dashed projection lines showing cancellation
            ctxCircle.strokeStyle = "rgba(255,255,255,0.2)";
            ctxCircle.lineWidth = 1;
            ctxCircle.setLineDash([3, 3]);
            ctxCircle.beginPath();
            ctxCircle.moveTo(cx + x1, cy - y1);
            ctxCircle.lineTo(cx + xTotal, cy - yTotal);
            ctxCircle.moveTo(cx + x2, cy - y2);
            ctxCircle.lineTo(cx + xTotal, cy - yTotal);
            ctxCircle.stroke();
            ctxCircle.setLineDash([]);
        } else if (mode === "superposition") {
            // Draw circle 2 centered at tip of phasor 1
            ctxCircle.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctxCircle.beginPath();
            ctxCircle.arc(cx + x1, cy - y1, r2, 0, 2 * Math.PI);
            ctxCircle.stroke();

            // Draw phasor 2 (purple)
            ctxCircle.strokeStyle = "#a78bfa";
            ctxCircle.fillStyle = "#a78bfa";
            ctxCircle.lineWidth = 2;
            ctxCircle.beginPath();
            ctxCircle.moveTo(cx + x1, cy - y1);
            ctxCircle.lineTo(cx + xTotal, cy - yTotal);
            ctxCircle.stroke();
            ctxCircle.beginPath();
            ctxCircle.arc(cx + xTotal, cy - yTotal, 3.5, 0, 2 * Math.PI);
            ctxCircle.fill();

            // Draw total sum vector (orange)
            ctxCircle.strokeStyle = "#f97316";
            ctxCircle.lineWidth = 2.5;
            ctxCircle.beginPath();
            ctxCircle.moveTo(cx, cy);
            ctxCircle.lineTo(cx + xTotal, cy - yTotal);
            ctxCircle.stroke();
        } else {
            // Single Mode projections to axes
            ctxCircle.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctxCircle.lineWidth = 1;
            ctxCircle.setLineDash([2, 2]);
            ctxCircle.beginPath();
            ctxCircle.moveTo(cx + x1, cy - y1);
            ctxCircle.lineTo(cx + x1, cy); // Real / Cosine projection
            ctxCircle.moveTo(cx + x1, cy - y1);
            ctxCircle.lineTo(cx, cy - y1); // Imag / Sine projection
            ctxCircle.stroke();
            ctxCircle.setLineDash([]);

            // Draw labels
            ctxCircle.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctxCircle.font = "8px Fira Code";
            ctxCircle.fillText("Real (cos)", cx + r1 - 10, cy - 5);
            ctxCircle.fillText("Imag (sin)", cx + 5, cy - r1 + 10);
        }

        // --- 3. Draw Waveform Canvas ---
        ctxWave.clearRect(0, 0, wWave, hWave);
        const wy = hWave / 2;

        // Draw axes
        ctxWave.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctxWave.lineWidth = 1;
        ctxWave.beginPath();
        ctxWave.moveTo(0, wy);
        ctxWave.lineTo(wWave, wy);
        ctxWave.stroke();

        const xStart = 20;
        const waveStep = (wWave - xStart - 10) / maxHistory;

        // --- Draw Waveforms ---
        // 1. Draw Individual Circle 1 Component Waveforms (Faint Dashed Lines)
        if (mode === "counter" || mode === "superposition") {
            // Real (cos1)
            ctxWave.strokeStyle = "rgba(13, 213, 197, 0.4)";
            ctxWave.lineWidth = 1.2;
            ctxWave.setLineDash([4, 4]);
            ctxWave.beginPath();
            for (let i = 0; i < waveHistory.length; i++) {
                const wx = xStart + i * waveStep;
                const val = waveHistory[i].real1;
                const valY = wy - val * 0.9;
                if (i === 0) ctxWave.moveTo(wx, valY); else ctxWave.lineTo(wx, valY);
            }
            ctxWave.stroke();
            ctxWave.setLineDash([]);

            // Imag (sin1) - only for superposition
            if (mode === "superposition") {
                ctxWave.strokeStyle = "rgba(236, 72, 153, 0.4)";
                ctxWave.lineWidth = 1.2;
                ctxWave.setLineDash([4, 4]);
                ctxWave.beginPath();
                for (let i = 0; i < waveHistory.length; i++) {
                    const wx = xStart + i * waveStep;
                    const val = waveHistory[i].imag1;
                    const valY = wy - val * 0.9;
                    if (i === 0) ctxWave.moveTo(wx, valY); else ctxWave.lineTo(wx, valY);
                }
                ctxWave.stroke();
                ctxWave.setLineDash([]);
            }
        }

        // 2. Draw Combined / Total Waveforms (Solid Thick Lines)
        // Combined Real (cos total)
        ctxWave.strokeStyle = "#0dd5c5";
        ctxWave.lineWidth = 2.8;
        ctxWave.beginPath();
        for (let i = 0; i < waveHistory.length; i++) {
            const wx = xStart + i * waveStep;
            const val = waveHistory[i].realTotal;
            const valY = wy - val * 0.9;
            if (i === 0) ctxWave.moveTo(wx, valY); else ctxWave.lineTo(wx, valY);
        }
        ctxWave.stroke();

        // Combined Imag (sin total)
        if (mode !== "counter") {
            ctxWave.strokeStyle = "#ec4899";
            ctxWave.lineWidth = 1.8;
            ctxWave.beginPath();
            for (let i = 0; i < waveHistory.length; i++) {
                const wx = xStart + i * waveStep;
                const val = waveHistory[i].imagTotal;
                const valY = wy - val * 0.9;
                if (i === 0) ctxWave.moveTo(wx, valY); else ctxWave.lineTo(wx, valY);
            }
            ctxWave.stroke();
        }

        // Current tip trackers (dots at wave heads)
        if (waveHistory.length > 0) {
            const lastTip = waveHistory[waveHistory.length - 1];
            
            // Combined Real head dot
            ctxWave.fillStyle = "#0dd5c5";
            ctxWave.beginPath();
            ctxWave.arc(xStart + (waveHistory.length - 1) * waveStep, wy - lastTip.realTotal * 0.9, 4, 0, 2*Math.PI);
            ctxWave.fill();

            // Combined Imag head dot
            if (mode !== "counter") {
                ctxWave.fillStyle = "#ec4899";
                ctxWave.beginPath();
                ctxWave.arc(xStart + (waveHistory.length - 1) * waveStep, wy - lastTip.imagTotal * 0.9, 3, 0, 2*Math.PI);
                ctxWave.fill();
            }
        }

        // Wave labels
        ctxWave.fillStyle = "#0dd5c5";
        ctxWave.font = "8px Fira Code";
        ctxWave.textAlign = "left";
        ctxWave.fillText("Real / Cosine", 5, 12);
        if (mode !== "counter") {
            ctxWave.fillStyle = "#ec4899";
            ctxWave.fillText("Imag / Sine", 5, 24);
        }
    }

    function animate() {
        if (running) {
            n += 0.5; // Increment time
            draw();
        }
        animationId = requestAnimationFrame(animate);
    }

    function togglePlay() {
        running = !running;
        btnPlay.innerText = running ? "⏸️ Pause" : "▶️ Play";
    }

    function resetPhasor() {
        n = 0;
        waveHistory = [];
        draw();
    }

    // Set listeners
    [sliderW1, sliderP1, sliderW2, selectMode].forEach(ctrl => {
        if (ctrl) {
            ctrl.addEventListener("input", () => {
                updateLayout();
                draw();
            });
            ctrl.addEventListener("change", () => {
                updateLayout();
                draw();
            });
        }
    });

    btnPlay.addEventListener("click", togglePlay);
    btnReset.addEventListener("click", resetPhasor);

    // Startup
    updateLayout();
    animate();
}

// ============================================================================
// 11. LTI Frequency Response & Group Delay Visualizer (Lecture 4)
// ============================================================================
function initFrequencyResponseSimulator() {
    const selectFilter = document.getElementById("select-l4-filter");
    const sliderPole = document.getElementById("slider-l4-pole");
    const valPole = document.getElementById("val-l4-pole");
    const valEq = document.getElementById("val-l4-eq");
    const valDelayDc = document.getElementById("val-l4-delay-dc");
    const valStatus = document.getElementById("val-l4-status");
    const selectTestSig = document.getElementById("select-l4-test-sig");
    
    const canvasMag = document.getElementById("canvas-l4-mag");
    const canvasPhase = document.getElementById("canvas-l4-phase");
    const canvasDelay = document.getElementById("canvas-l4-delay");
    const canvasTime = document.getElementById("canvas-l4-time");
    const canvasZPlane = document.getElementById("canvas-l4-zplane");
    
    if (!canvasMag || !canvasPhase || !canvasDelay || !canvasTime || !canvasZPlane) return;
    
    const ctxMag = canvasMag.getContext("2d");
    const ctxPhase = canvasPhase.getContext("2d");
    const ctxDelay = canvasDelay.getContext("2d");
    const ctxTime = canvasTime.getContext("2d");
    const ctxZPlane = canvasZPlane.getContext("2d");

    function resize() {
        canvasMag.width = canvasMag.parentElement.clientWidth * window.devicePixelRatio;
        canvasMag.height = 120 * window.devicePixelRatio;
        canvasPhase.width = canvasPhase.parentElement.clientWidth * window.devicePixelRatio;
        canvasPhase.height = 120 * window.devicePixelRatio;
        canvasDelay.width = canvasDelay.parentElement.clientWidth * window.devicePixelRatio;
        canvasDelay.height = 120 * window.devicePixelRatio;
        canvasTime.width = canvasTime.parentElement.clientWidth * window.devicePixelRatio;
        canvasTime.height = 120 * window.devicePixelRatio;
        canvasZPlane.width = canvasZPlane.parentElement.clientWidth * window.devicePixelRatio;
        canvasZPlane.height = 140 * window.devicePixelRatio;
        
        ctxMag.resetTransform();
        ctxMag.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctxPhase.resetTransform();
        ctxPhase.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctxDelay.resetTransform();
        ctxDelay.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctxTime.resetTransform();
        ctxTime.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctxZPlane.resetTransform();
        ctxZPlane.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const type = selectFilter.value;
        if (type === "lpf" && selectFilter.dataset.lastVal !== "lpf") {
            sliderPole.value = 0.80;
            selectFilter.dataset.lastVal = "lpf";
        } else if (type === "hpf" && selectFilter.dataset.lastVal !== "hpf") {
            sliderPole.value = -0.80;
            selectFilter.dataset.lastVal = "hpf";
        } else if (type === "custom") {
            selectFilter.dataset.lastVal = "custom";
        }
        
        const r = parseFloat(sliderPole.value);
        valPole.innerText = r.toFixed(2);

        const wMag = canvasMag.width / window.devicePixelRatio;
        const hMag = canvasMag.height / window.devicePixelRatio;
        const wPhase = canvasPhase.width / window.devicePixelRatio;
        const hPhase = canvasPhase.height / window.devicePixelRatio;
        const wDelay = canvasDelay.width / window.devicePixelRatio;
        const hDelay = canvasDelay.height / window.devicePixelRatio;

        // Formula representation
        const sign = r >= 0 ? "-" : "+";
        valEq.innerText = `H(e^{j\u03c9}) = 1 / (1 ${sign} ${Math.abs(r).toFixed(2)}e^{-j\u03c9})`;

        // Calculate delay at DC: tau_g(0) = r / (1 - r)
        let delayDC = r / (1 - r + 1e-15);
        valDelayDc.innerText = delayDC.toFixed(2);

        // Classification Pill
        if (r > 0) {
            valStatus.className = "status-pill success";
            valStatus.innerHTML = "&bull; Low-Pass Filter";
        } else if (r < 0) {
            valStatus.className = "status-pill danger";
            valStatus.innerHTML = "&bull; High-Pass Filter";
        } else {
            valStatus.className = "status-pill info";
            valStatus.innerHTML = "&bull; Flat Response";
        }

        // Generate frequency response data (w = -pi to pi)
        const numPoints = 120;
        const magData = [];
        const phaseData = [];
        const delayData = [];
        const margin = 20;

        for (let i = 0; i < numPoints; i++) {
            const w = -Math.PI + (i / (numPoints - 1)) * 2 * Math.PI;
            
            // H(e^jw) = 1 / (1 - r * e^-jw)
            const denReal = 1 - r * Math.cos(w);
            const denImag = r * Math.sin(w);
            const denSq = denReal * denReal + denImag * denImag;
            
            // Magnitude: 1 / sqrt(denSq)
            const mag = 1 / Math.sqrt(denSq);
            magData.push(mag);

            // Phase: atan2(-denImag, denReal)
            const phase = Math.atan2(-denImag, denReal);
            phaseData.push(phase);

            // Group delay: (r*cos(w) - r^2) / (1 + r^2 - 2r*cos(w))
            const delay = (r * Math.cos(w) - r * r) / (1 + r * r - 2 * r * Math.cos(w) + 1e-15);
            delayData.push(delay);
        }

        // Draw Canvas 1: Magnitude Response
        ctxMag.clearRect(0, 0, wMag, hMag);
        ctxMag.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctxMag.lineWidth = 1;
        const x_minus_pi = margin;
        const x_zero = wMag / 2;
        const x_plus_pi = wMag - margin;

        ctxMag.beginPath();
        ctxMag.moveTo(x_minus_pi, 0); ctxMag.lineTo(x_minus_pi, hMag);
        ctxMag.moveTo(x_zero, 0); ctxMag.lineTo(x_zero, hMag);
        ctxMag.moveTo(x_plus_pi, 0); ctxMag.lineTo(x_plus_pi, hMag);
        ctxMag.stroke();

        let maxMag = Math.max(...magData);
        if (maxMag < 1.0) maxMag = 1.0;
        const scaleMag = (hMag - 25) / maxMag;

        ctxMag.strokeStyle = "#0dd5c5";
        ctxMag.lineWidth = 2.5;
        ctxMag.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const x = margin + (i / (numPoints - 1)) * (wMag - 2 * margin);
            const y = hMag - 15 - magData[i] * scaleMag;
            if (i === 0) ctxMag.moveTo(x, y); else ctxMag.lineTo(x, y);
        }
        ctxMag.stroke();

        ctxMag.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctxMag.font = "8px Fira Code";
        ctxMag.textAlign = "center";
        ctxMag.fillText("-\u03c0", x_minus_pi, hMag - 4);
        ctxMag.fillText("0", x_zero, hMag - 4);
        ctxMag.fillText("\u03c0", x_plus_pi, hMag - 4);


        // Draw Canvas 2: Phase Response
        ctxPhase.clearRect(0, 0, wPhase, hPhase);
        ctxPhase.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctxPhase.lineWidth = 1;
        ctxPhase.beginPath();
        ctxPhase.moveTo(0, hPhase / 2);
        ctxPhase.lineTo(wPhase, hPhase / 2);
        ctxPhase.moveTo(x_minus_pi, 0); ctxPhase.lineTo(x_minus_pi, hPhase);
        ctxPhase.moveTo(x_zero, 0); ctxPhase.lineTo(x_zero, hPhase);
        ctxPhase.moveTo(x_plus_pi, 0); ctxPhase.lineTo(x_plus_pi, hPhase);
        ctxPhase.stroke();

        ctxPhase.strokeStyle = "#8b5cf6";
        ctxPhase.lineWidth = 2;
        const scalePhase = (hPhase / 2 - 15) / Math.PI;
        
        ctxPhase.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const x = margin + (i / (numPoints - 1)) * (wPhase - 2 * margin);
            const y = hPhase / 2 - phaseData[i] * scalePhase;
            if (i === 0) ctxPhase.moveTo(x, y); else ctxPhase.lineTo(x, y);
        }
        ctxPhase.stroke();

        ctxPhase.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctxPhase.font = "8px Fira Code";
        ctxPhase.textAlign = "center";
        ctxPhase.fillText("-\u03c0", x_minus_pi, hPhase - 4);
        ctxPhase.fillText("0", x_zero, hPhase - 4);
        ctxPhase.fillText("\u03c0", x_plus_pi, hPhase - 4);


        // Draw Canvas 3: Group Delay Response
        ctxDelay.clearRect(0, 0, wDelay, hDelay);
        ctxDelay.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctxDelay.lineWidth = 1;
        // Zero delay line (or offset)
        // Group delay can be negative, but let's draw middle axis at y = h/2 or let bottom be 0.
        // Actually, let's set a baseline at h - 20 (y = 0 delay) and plot upwards.
        // What if delay is negative? First order filter delay can go down to -r/(1+r) which is negative.
        // Let's set the middle axis as 0 delay.
        ctxDelay.beginPath();
        ctxDelay.moveTo(0, hDelay / 2 + 10);
        ctxDelay.lineTo(wDelay, hDelay / 2 + 10);
        ctxDelay.moveTo(x_minus_pi, 0); ctxDelay.lineTo(x_minus_pi, hDelay);
        ctxDelay.moveTo(x_zero, 0); ctxDelay.lineTo(x_zero, hDelay);
        ctxDelay.moveTo(x_plus_pi, 0); ctxDelay.lineTo(x_plus_pi, hDelay);
        ctxDelay.stroke();

        let maxDelay = Math.max(...delayData.map(Math.abs));
        if (maxDelay < 1.0) maxDelay = 1.0;
        const scaleDelay = (hDelay / 2 - 20) / maxDelay;
        const centerYDelay = hDelay / 2 + 10;

        ctxDelay.strokeStyle = "#ef4444";
        ctxDelay.lineWidth = 2.5;
        ctxDelay.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const x = margin + (i / (numPoints - 1)) * (wDelay - 2 * margin);
            const y = centerYDelay - delayData[i] * scaleDelay;
            if (i === 0) ctxDelay.moveTo(x, y); else ctxDelay.lineTo(x, y);
        }
        ctxDelay.stroke();

        ctxDelay.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctxDelay.font = "8px Fira Code";
        ctxDelay.textAlign = "center";
        ctxDelay.fillText("-\u03c0", x_minus_pi, hDelay - 4);
        ctxDelay.fillText("0", x_zero, hDelay - 4);
        ctxDelay.fillText("\u03c0", x_plus_pi, hDelay - 4);

        // --- Draw Canvas 4: Time-Domain Filtering Impact ---
        const wTime = canvasTime.width / window.devicePixelRatio;
        const hTime = canvasTime.height / window.devicePixelRatio;
        ctxTime.clearRect(0, 0, wTime, hTime);

        // Generate test input signal
        const testSigType = selectTestSig.value;
        const len = 50;
        const X_sig = [];
        const Y_sig = [];
        let prevY = 0;

        for (let n = 0; n < len; n++) {
            let valX = 0;
            if (testSigType === "sine_low") {
                valX = Math.cos(0.08 * Math.PI * n);
            } else if (testSigType === "sine_high") {
                valX = Math.cos(0.40 * Math.PI * n);
            } else if (testSigType === "step") {
                valX = n >= 5 ? 1 : 0;
            }
            X_sig.push(valX);
            
            // Difference equation: y[n] = r * y[n-1] + x[n]
            const valY = r * prevY + valX;
            Y_sig.push(valY);
            prevY = valY;
        }

        // Draw time axis
        ctxTime.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctxTime.lineWidth = 1;
        ctxTime.beginPath();
        ctxTime.moveTo(0, hTime / 2);
        ctxTime.lineTo(wTime, hTime / 2);
        ctxTime.stroke();

        const xStart = 25;
        const timeStep = (wTime - xStart - 10) / len;
        const centerYTime = hTime / 2;

        // Find max absolute values for scaling
        let maxVal = Math.max(...X_sig.map(Math.abs), ...Y_sig.map(Math.abs));
        if (maxVal < 1.0) maxVal = 1.0;
        const scaleValY = (hTime / 2 - 15) / maxVal;

        // Draw input signal x[n] (faint dashed line with stems)
        ctxTime.strokeStyle = "rgba(13, 213, 197, 0.3)";
        ctxTime.fillStyle = "rgba(13, 213, 197, 0.3)";
        ctxTime.lineWidth = 1;
        for (let n = 0; n < len; n++) {
            const x = xStart + n * timeStep;
            const y = centerYTime - X_sig[n] * scaleValY;
            ctxTime.beginPath();
            ctxTime.moveTo(x, centerYTime);
            ctxTime.lineTo(x, y);
            ctxTime.stroke();
            ctxTime.beginPath();
            ctxTime.arc(x, y, 2, 0, 2 * Math.PI);
            ctxTime.fill();
        }

        // Draw output signal y[n] (thick solid line)
        ctxTime.strokeStyle = "#a78bfa";
        ctxTime.lineWidth = 2.2;
        ctxTime.beginPath();
        for (let n = 0; n < len; n++) {
            const x = xStart + n * timeStep;
            const y = centerYTime - Y_sig[n] * scaleValY;
            if (n === 0) ctxTime.moveTo(x, y); else ctxTime.lineTo(x, y);
        }
        ctxTime.stroke();

        // Dots on output signal
        ctxTime.fillStyle = "#a78bfa";
        for (let n = 0; n < len; n++) {
            const x = xStart + n * timeStep;
            const y = centerYTime - Y_sig[n] * scaleValY;
            ctxTime.beginPath();
            ctxTime.arc(x, y, 2.5, 0, 2 * Math.PI);
            ctxTime.fill();
        }

        // Labels
        ctxTime.font = "8px Fira Code";
        ctxTime.textAlign = "left";
        ctxTime.fillStyle = "rgba(13, 213, 197, 0.7)";
        ctxTime.fillText("Input x[n]", 5, 12);
        ctxTime.fillStyle = "#a78bfa";
        ctxTime.fillText("Output y[n]", 5, 22);

        // --- Draw Canvas 5: Z-Plane Pole-Zero Plot ---
        const wZP = canvasZPlane.width / window.devicePixelRatio;
        const hZP = canvasZPlane.height / window.devicePixelRatio;
        ctxZPlane.clearRect(0, 0, wZP, hZP);

        const cxZP = wZP / 2;
        const cyZP = hZP / 2;
        const radiusZP = 45; // Radius of unit circle

        // Draw axes
        ctxZPlane.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctxZPlane.lineWidth = 1;
        ctxZPlane.beginPath();
        ctxZPlane.moveTo(0, cyZP); ctxZPlane.lineTo(wZP, cyZP);
        ctxZPlane.moveTo(cxZP, 0); ctxZPlane.lineTo(cxZP, hZP);
        ctxZPlane.stroke();

        // Draw Unit Circle
        ctxZPlane.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctxZPlane.beginPath();
        ctxZPlane.arc(cxZP, cyZP, radiusZP, 0, 2 * Math.PI);
        ctxZPlane.stroke();

        // Draw Zero at the origin (blue O)
        ctxZPlane.strokeStyle = "#0dd5c5";
        ctxZPlane.lineWidth = 2;
        ctxZPlane.beginPath();
        ctxZPlane.arc(cxZP, cyZP, 3, 0, 2 * Math.PI);
        ctxZPlane.stroke();
        ctxZPlane.fillStyle = "rgba(13, 213, 197, 0.1)";
        ctxZPlane.fill();
        
        // Draw Pole (red cross X) at location z = r
        const poleX = cxZP + r * radiusZP;
        const poleY = cyZP;
        ctxZPlane.strokeStyle = "#ef4444";
        ctxZPlane.lineWidth = 2.5;
        ctxZPlane.beginPath();
        // Draw 'X'
        ctxZPlane.moveTo(poleX - 4, poleY - 4);
        ctxZPlane.lineTo(poleX + 4, poleY + 4);
        ctxZPlane.moveTo(poleX - 4, poleY + 4);
        ctxZPlane.lineTo(poleX + 4, poleY - 4);
        ctxZPlane.stroke();

        // Labels
        ctxZPlane.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctxZPlane.font = "8px Fira Code";
        ctxZPlane.textAlign = "center";
        ctxZPlane.fillText("Re", wZP - 10, cyZP - 4);
        ctxZPlane.fillText("Im", cxZP + 10, 10);
        ctxZPlane.fillText("1.0", cxZP + radiusZP, cyZP + 12);
        ctxZPlane.fillText("-1.0", cxZP - radiusZP, cyZP + 12);
    }

    [selectFilter, sliderPole, selectTestSig].forEach(ctrl => {
        if (ctrl) {
            ctrl.addEventListener("input", () => {
                if (ctrl === sliderPole) {
                    selectFilter.value = "custom";
                }
                draw();
            });
            ctrl.addEventListener("change", () => {
                if (ctrl === sliderPole) {
                    selectFilter.value = "custom";
                }
                draw();
            });
        }
    });

    draw();
}

// ============================================================================
// 12. Z-Transform Complex Z-Plane & ROC Visualizer (Lecture 5)
// ============================================================================
function initZTransformSimulator() {
    const selectSig = document.getElementById("select-l5-sig");
    const sliderA = document.getElementById("slider-l5-a");
    const sliderB = document.getElementById("slider-l5-b");
    
    const valA = document.getElementById("val-l5-a");
    const valB = document.getElementById("val-l5-b");
    const groupB = document.getElementById("group-l5-b");
    
    const valRocDesc = document.getElementById("val-l5-roc-desc");
    const valPolesList = document.getElementById("val-l5-poles-list");
    const valStatus = document.getElementById("val-l5-status");
    
    const canvas = document.getElementById("canvas-zplane");
    
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
        canvas.height = canvas.width; // square aspect ratio
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const type = selectSig.value;
        const a = parseFloat(sliderA.value);
        const b = parseFloat(sliderB.value);

        valA.innerText = a.toFixed(2);
        valB.innerText = b.toFixed(2);

        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;

        // Clear canvas
        ctx.clearRect(0, 0, w, h);

        const scale = 70; // 1 unit = 70px
        const cx = w / 2;
        const cy = h / 2;

        // Draw real and imaginary axes
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, cy); ctx.lineTo(w, cy);
        ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
        ctx.stroke();

        // Draw ticks
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = "8px Fira Code";
        ctx.textAlign = "center";
        ctx.fillText("-1", cx - scale, cy + 12);
        ctx.fillText("1", cx + scale, cy + 12);
        ctx.fillText("Re", w - 10, cy - 5);
        ctx.fillText("Im", cx + 10, 10);

        // Draw Unit Circle (dashed)
        ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, scale, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]); // reset

        let r_in = Math.abs(a);
        let r_out = Math.abs(b);
        let isStable = false;

        if (type === "causal") {
            groupB.style.display = "none";
            r_in = Math.abs(a);
            
            valRocDesc.innerHTML = `|z| > ${r_in.toFixed(2)}`;
            valPolesList.innerText = `z = ${a.toFixed(2)}`;
            isStable = r_in < 1.0;

            // Draw Causal ROC: everything outside radius |a|
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, w, h);
            ctx.arc(cx, cy, r_in * scale, 0, 2 * Math.PI, true); // counter-clockwise cuts the hole
            ctx.fillStyle = "rgba(13, 213, 197, 0.12)";
            ctx.fill();
            ctx.restore();

            // Draw boundary circle (solid thin line)
            ctx.strokeStyle = "rgba(13, 213, 197, 0.5)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, r_in * scale, 0, 2 * Math.PI);
            ctx.stroke();

            // Draw pole at z = a
            drawPole(a, 0);
            // Draw zero at origin
            drawZero(0, 0);

        } else if (type === "anticausal") {
            groupB.style.display = "none";
            r_in = Math.abs(a);

            valRocDesc.innerHTML = `|z| < ${r_in.toFixed(2)}`;
            valPolesList.innerText = `z = ${a.toFixed(2)}`;
            isStable = r_in > 1.0;

            // Draw Anti-Causal ROC: inside radius |a|
            ctx.beginPath();
            ctx.arc(cx, cy, r_in * scale, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(13, 213, 197, 0.12)";
            ctx.fill();

            // Draw boundary circle
            ctx.strokeStyle = "rgba(13, 213, 197, 0.5)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, r_in * scale, 0, 2 * Math.PI);
            ctx.stroke();

            // Draw pole at z = a
            drawPole(a, 0);
            drawZero(0, 0);

        } else if (type === "twosided") {
            groupB.style.display = "block";
            // Ensure bounds are consistent
            const pole1 = a;
            const pole2 = b;
            const r1 = Math.min(Math.abs(pole1), Math.abs(pole2));
            const r2 = Math.max(Math.abs(pole1), Math.abs(pole2));
            
            r_in = r1;
            r_out = r2;

            valRocDesc.innerHTML = `${r_in.toFixed(2)} < |z| < ${r_out.toFixed(2)}`;
            valPolesList.innerText = `z = ${pole1.toFixed(2)}, z = ${pole2.toFixed(2)}`;
            
            // Check stability: ROC contains the unit circle (|z|=1)
            isStable = (r_in < 1.0) && (r_out > 1.0);

            // Draw Ring ROC: between r_in and r_out
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r_out * scale, 0, 2 * Math.PI);
            ctx.arc(cx, cy, r_in * scale, 0, 2 * Math.PI, true); // cut inner hole
            ctx.fillStyle = "rgba(13, 213, 197, 0.12)";
            ctx.fill();
            ctx.restore();

            // Draw boundary circles
            ctx.strokeStyle = "rgba(13, 213, 197, 0.4)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, r_in * scale, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, r_out * scale, 0, 2 * Math.PI);
            ctx.stroke();

            // Draw poles
            drawPole(pole1, 0);
            drawPole(pole2, 0);
            drawZero(0, 0);
        }

        // Stability Label
        if (isStable) {
            valStatus.className = "status-pill success";
            valStatus.innerHTML = "&bull; Stable System";
        } else {
            valStatus.className = "status-pill danger";
            valStatus.innerHTML = "&bull; Unstable System";
        }

        // Draw cross for pole
        function drawPole(real, imag) {
            const px = cx + real * scale;
            const py = cy - imag * scale;
            const size = 5;

            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px - size, py - size);
            ctx.lineTo(px + size, py + size);
            ctx.moveTo(px + size, py - size);
            ctx.lineTo(px - size, py + size);
            ctx.stroke();
        }

        // Draw circle for zero
        function drawZero(real, imag) {
            const zx = cx + real * scale;
            const zy = cy - imag * scale;
            const rZero = 4;

            ctx.strokeStyle = "#10b981";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(zx, zy, rZero, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    [selectSig, sliderA, sliderB].forEach(ctrl => {
        ctrl.addEventListener("input", draw);
    });

    draw();
}

// ============================================================================
// 13. Inverse Z-Transform & Stability Simulator (Lecture 6)
// ============================================================================
function initInverseZSimulator() {
    const selectSig = document.getElementById("select-l6-sig");
    const sliderA = document.getElementById("slider-l6-a");
    const sliderB = document.getElementById("slider-l6-b");
    
    const valA = document.getElementById("val-l6-a");
    const valB = document.getElementById("val-l6-b");
    const valEqn = document.getElementById("val-l6-eqn");
    const valRocDesc = document.getElementById("val-l6-roc-desc");
    const valPolesList = document.getElementById("val-l6-poles-list");
    const valStableStatus = document.getElementById("val-l6-stable-status");
    const valCausalStatus = document.getElementById("val-l6-causal-status");
    
    const canvasZ = document.getElementById("canvas-l6-zplane");
    const canvasH = document.getElementById("canvas-l6-impulse");
    
    if (!canvasZ || !canvasH) return;
    
    const ctxZ = canvasZ.getContext("2d");
    const ctxH = canvasH.getContext("2d");

    function resize() {
        // Z-plane is square
        canvasZ.width = canvasZ.parentElement.clientWidth * window.devicePixelRatio;
        canvasZ.height = canvasZ.width;
        ctxZ.resetTransform();
        ctxZ.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Impulse response is rectangular
        canvasH.width = canvasH.parentElement.clientWidth * window.devicePixelRatio;
        canvasH.height = 280 * window.devicePixelRatio;
        ctxH.resetTransform();
        ctxH.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const type = selectSig.value;
        let a = parseFloat(sliderA.value);
        let b = parseFloat(sliderB.value);

        // Prevent divide-by-zero or identical poles simplification for distinct pole simulator
        if (Math.abs(a - b) < 0.01) {
            b = a + 0.01;
        }

        valA.innerText = a.toFixed(2);
        valB.innerText = b.toFixed(2);

        const wZ = canvasZ.width / window.devicePixelRatio;
        const hZ = canvasZ.height / window.devicePixelRatio;
        const wH = canvasH.width / window.devicePixelRatio;
        const hH = canvasH.height / window.devicePixelRatio;

        // Calculate residues for: H(z)/z = z / ((z-a)(z-b)) = A / (z-a) + B / (z-b)
        // A = a / (a-b), B = b / (b-a)
        const A = a / (a - b);
        const B = b / (b - a);

        // -------------------------------------------------------------
        // 1. Render Equation
        // -------------------------------------------------------------
        const termA = `${A >= 0 ? "" : "- "}${Math.abs(A).toFixed(2)}z / (z ${a >= 0 ? "-" : "+"} ${Math.abs(a).toFixed(2)})`;
        const termB = `${B >= 0 ? "+ " : "- "}${Math.abs(B).toFixed(2)}z / (z ${b >= 0 ? "-" : "+"} ${Math.abs(b).toFixed(2)})`;
        valEqn.innerHTML = `H(z) = ${termA} ${termB}`;

        // -------------------------------------------------------------
        // 2. Compute ROC & Stability Boundaries
        // -------------------------------------------------------------
        const r_min = Math.min(Math.abs(a), Math.abs(b));
        const r_max = Math.max(Math.abs(a), Math.abs(b));
        let isStable = false;

        if (type === "causal") {
            valRocDesc.innerHTML = `|z| > ${r_max.toFixed(2)}`;
            isStable = r_max < 1.0;
        } else if (type === "anticausal") {
            valRocDesc.innerHTML = `|z| < ${r_min.toFixed(2)}`;
            isStable = r_min > 1.0;
        } else if (type === "twosided") {
            valRocDesc.innerHTML = `${r_min.toFixed(2)} < |z| < ${r_max.toFixed(2)}`;
            isStable = (r_min < 1.0) && (r_max > 1.0);
        }

        valPolesList.innerText = `z = ${a.toFixed(2)}, ${b.toFixed(2)}`;
        
        // Status pills
        valStableStatus.className = isStable ? "status-pill success" : "status-pill danger";
        valStableStatus.innerHTML = isStable ? "&bull; Stable" : "&bull; Unstable";
        
        valCausalStatus.className = (type === "causal") ? "status-pill success" : "status-pill danger";
        valCausalStatus.innerHTML = (type === "causal") ? "&bull; Causal" : "&bull; Non-Causal";

        // -------------------------------------------------------------
        // 3. Draw Z-Plane Canvas
        // -------------------------------------------------------------
        ctxZ.clearRect(0, 0, wZ, hZ);
        const scaleZ = 75; // 1 unit = 75px
        const cxZ = wZ / 2;
        const cyZ = hZ / 2;

        // Draw axes
        ctxZ.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctxZ.lineWidth = 1;
        ctxZ.beginPath();
        ctxZ.moveTo(0, cyZ); ctxZ.lineTo(wZ, cyZ);
        ctxZ.moveTo(cxZ, 0); ctxZ.lineTo(cxZ, hZ);
        ctxZ.stroke();

        // Draw labels
        ctxZ.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctxZ.font = "8px Fira Code";
        ctxZ.textAlign = "center";
        ctxZ.fillText("-1", cxZ - scaleZ, cyZ + 12);
        ctxZ.fillText("1", cxZ + scaleZ, cyZ + 12);
        ctxZ.fillText("Re", wZ - 10, cyZ - 5);
        ctxZ.fillText("Im", cxZ + 10, 10);

        // Draw Unit Circle (dashed)
        ctxZ.strokeStyle = "rgba(99, 102, 241, 0.4)";
        ctxZ.lineWidth = 1.2;
        ctxZ.setLineDash([4, 4]);
        ctxZ.beginPath();
        ctxZ.arc(cxZ, cyZ, scaleZ, 0, 2 * Math.PI);
        ctxZ.stroke();
        ctxZ.setLineDash([]); // reset

        // Draw ROC shading
        if (type === "causal") {
            ctxZ.save();
            ctxZ.beginPath();
            ctxZ.rect(0, 0, wZ, hZ);
            ctxZ.arc(cxZ, cyZ, r_max * scaleZ, 0, 2 * Math.PI, true);
            ctxZ.fillStyle = "rgba(13, 213, 197, 0.12)";
            ctxZ.fill();
            ctxZ.restore();

            // Outer boundary circle
            ctxZ.strokeStyle = "rgba(13, 213, 197, 0.5)";
            ctxZ.beginPath();
            ctxZ.arc(cxZ, cyZ, r_max * scaleZ, 0, 2 * Math.PI);
            ctxZ.stroke();
        } else if (type === "anticausal") {
            ctxZ.beginPath();
            ctxZ.arc(cxZ, cyZ, r_min * scaleZ, 0, 2 * Math.PI);
            ctxZ.fillStyle = "rgba(13, 213, 197, 0.12)";
            ctxZ.fill();

            // Inner boundary circle
            ctxZ.strokeStyle = "rgba(13, 213, 197, 0.5)";
            ctxZ.beginPath();
            ctxZ.arc(cxZ, cyZ, r_min * scaleZ, 0, 2 * Math.PI);
            ctxZ.stroke();
        } else if (type === "twosided") {
            ctxZ.save();
            ctxZ.beginPath();
            ctxZ.arc(cxZ, cyZ, r_max * scaleZ, 0, 2 * Math.PI);
            ctxZ.arc(cxZ, cyZ, r_min * scaleZ, 0, 2 * Math.PI, true);
            ctxZ.fillStyle = "rgba(13, 213, 197, 0.12)";
            ctxZ.fill();
            ctxZ.restore();

            // Boundary circles
            ctxZ.strokeStyle = "rgba(13, 213, 197, 0.4)";
            ctxZ.beginPath();
            ctxZ.arc(cxZ, cyZ, r_min * scaleZ, 0, 2 * Math.PI);
            ctxZ.stroke();
            ctxZ.beginPath();
            ctxZ.arc(cxZ, cyZ, r_max * scaleZ, 0, 2 * Math.PI);
            ctxZ.stroke();
        }

        // Draw double zeros at origin (since H(z) has z^2 in numerator)
        drawZero(0, 0, true);

        // Draw poles
        drawPole(a, 0);
        drawPole(b, 0);

        function drawPole(real, imag) {
            const px = cxZ + real * scaleZ;
            const py = cyZ - imag * scaleZ;
            const size = 5;
            ctxZ.strokeStyle = "#ef4444";
            ctxZ.lineWidth = 2;
            ctxZ.beginPath();
            ctxZ.moveTo(px - size, py - size);
            ctxZ.lineTo(px + size, py + size);
            ctxZ.moveTo(px + size, py - size);
            ctxZ.lineTo(px - size, py + size);
            ctxZ.stroke();
        }

        function drawZero(real, imag, isDouble) {
            const zx = cxZ + real * scaleZ;
            const zy = cyZ - imag * scaleZ;
            const rZero = 4;
            ctxZ.strokeStyle = "#10b981";
            ctxZ.lineWidth = 1.8;
            ctxZ.beginPath();
            ctxZ.arc(zx, zy, rZero, 0, 2 * Math.PI);
            ctxZ.stroke();
            if (isDouble) {
                ctxZ.beginPath();
                ctxZ.arc(zx, zy, rZero + 3, 0, 2 * Math.PI);
                ctxZ.stroke();
            }
        }

        // -------------------------------------------------------------
        // 4. Compute & Draw Impulse Response h[n]
        // -------------------------------------------------------------
        ctxH.clearRect(0, 0, wH, hH);

        const startN = -8;
        const endN = 14;
        const n_vals = [];
        const h_vals = [];

        // Compute h[n] values
        for (let n = startN; n <= endN; n++) {
            n_vals.push(n);
            let val = 0;

            if (type === "causal") {
                if (n >= 0) {
                    val = A * Math.pow(a, n) + B * Math.pow(b, n);
                }
            } else if (type === "anticausal") {
                if (n < 0) {
                    val = -(A * Math.pow(a, n) + B * Math.pow(b, n));
                }
            } else if (type === "twosided") {
                const ra = Math.abs(a);
                const rb = Math.abs(b);
                if (ra < rb) {
                    // pole a is smaller -> causal
                    // pole b is larger -> anti-causal
                    if (n >= 0) {
                        val = A * Math.pow(a, n);
                    } else {
                        val = -B * Math.pow(b, n);
                    }
                } else {
                    // pole b is smaller -> causal
                    // pole a is larger -> anti-causal
                    if (n >= 0) {
                        val = B * Math.pow(b, n);
                    } else {
                        val = -A * Math.pow(a, n);
                    }
                }
            }
            h_vals.push(val);
        }

        // Find max scale factor
        let maxH = 1.0;
        h_vals.forEach(v => {
            if (isFinite(v) && Math.abs(v) > maxH) {
                maxH = Math.abs(v);
            }
        });
        if (maxH > 15.0) maxH = 15.0; // clamp scale so explosion doesn't flatten details

        const padX = 30;
        const padY = 20;
        const plotW = wH - 2 * padX;
        const plotH = hH - 2 * padY;
        const axisYH = hH / 2;

        // Draw horizontal line for y = 0
        ctxH.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctxH.lineWidth = 1;
        ctxH.beginPath();
        ctxH.moveTo(padX, axisYH);
        ctxH.lineTo(wH - padX, axisYH);
        ctxH.stroke();

        // Draw vertical grid line for n = 0
        const idxZero = 0 - startN;
        const xZeroH = padX + (idxZero / (endN - startN)) * plotW;
        ctxH.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctxH.lineWidth = 1;
        ctxH.beginPath();
        ctxH.moveTo(xZeroH, padY);
        ctxH.lineTo(xZeroH, hH - padY);
        ctxH.stroke();

        // Plot stems
        for (let i = 0; i < h_vals.length; i++) {
            const n = n_vals[i];
            const v = h_vals[i];

            const x = padX + (i / (endN - startN)) * plotW;
            
            // Limit drawing coords to prevent Canvas error if exploding to infinity
            let drawVal = v;
            if (drawVal > maxH * 1.5) drawVal = maxH * 1.5;
            if (drawVal < -maxH * 1.5) drawVal = -maxH * 1.5;
            const y = axisYH - (drawVal / maxH) * (plotH / 2);

            // Set color based on stability
            ctxH.strokeStyle = isStable ? "#10b981" : "#ef4444";
            ctxH.fillStyle = isStable ? "#10b981" : "#ef4444";
            ctxH.lineWidth = 1.8;

            // Draw line
            ctxH.beginPath();
            ctxH.moveTo(x, axisYH);
            ctxH.lineTo(x, y);
            ctxH.stroke();

            // Draw circle
            ctxH.beginPath();
            ctxH.arc(x, y, 3, 0, 2 * Math.PI);
            ctxH.fill();

            // Label n ticks (multiples of 2)
            if (n % 2 === 0) {
                ctxH.fillStyle = "rgba(255, 255, 255, 0.4)";
                ctxH.font = "8px Fira Code";
                ctxH.textAlign = "center";
                ctxH.fillText(n.toString(), x, axisYH + 12);
            }
        }

        // Draw labels
        ctxH.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctxH.font = "9px sans-serif";
        ctxH.textAlign = "right";
        ctxH.fillText("h[n]", wH - padX, axisYH - 8);
        ctxH.textAlign = "left";
        ctxH.fillText("n", wH - padX + 5, axisYH + 3);
    }

    [selectSig, sliderA, sliderB].forEach(ctrl => {
        ctrl.addEventListener("input", draw);
    });

    draw();
}

// ============================================================================
// 14. DFT Matrix & Spectrum Simulator (Lecture 7)
// ============================================================================
function initDFTSimulator() {
    const selectPreset = document.getElementById("select-l7-preset");
    const sliderFreq = document.getElementById("slider-l7-freq");
    const sliderWidth = document.getElementById("slider-l7-width");
    
    const valFreq = document.getElementById("val-l7-freq");
    const valWidth = document.getElementById("val-l7-width");
    
    const groupSine = document.getElementById("group-l7-sine");
    const groupPulse = document.getElementById("group-l7-pulse");
    const groupSliders = document.getElementById("group-l7-sliders");
    
    const matrixMode = document.getElementById("select-l7-matrix-mode");
    const matrixGrid = document.getElementById("dft-matrix-grid");
    const matrixTooltip = document.getElementById("dft-matrix-tooltip");
    
    const canvasIn = document.getElementById("canvas-l7-input");
    const canvasMag = document.getElementById("canvas-l7-mag");

    if (!canvasIn || !canvasMag || !matrixGrid) return;

    const ctxIn = canvasIn.getContext("2d");
    const ctxMag = canvasMag.getContext("2d");

    // Gather custom sliders
    const slidersX = [];
    const valX = [];
    for (let i = 0; i < 8; i++) {
        slidersX.push(document.getElementById(`slider-l7-x${i}`));
        valX.push(document.getElementById(`val-l7-x${i}`));
    }

    function resize() {
        // Set dimensions
        canvasIn.width = canvasIn.parentElement.clientWidth * window.devicePixelRatio;
        canvasIn.height = 180 * window.devicePixelRatio;
        ctxIn.resetTransform();
        ctxIn.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasMag.width = canvasMag.parentElement.clientWidth * window.devicePixelRatio;
        canvasMag.height = 180 * window.devicePixelRatio;
        ctxMag.resetTransform();
        ctxMag.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    // Render static DFT Matrix items once, attach hover events
    function initMatrixGrid() {
        matrixGrid.innerHTML = "";
        const mode = matrixMode.value;

        for (let k = 0; k < 8; k++) {
            for (let n = 0; n < 8; n++) {
                const angle = (2 * Math.PI * k * n) / 8;
                const realVal = Math.cos(angle);
                const imagVal = -Math.sin(angle);
                const val = (mode === "real") ? realVal : imagVal;

                // Color cell based on value
                let cellBg = "rgba(255, 255, 255, 0.05)";
                if (val > 0.05) {
                    cellBg = `rgba(16, 185, 129, ${val * 0.45})`; // Green gradient
                } else if (val < -0.05) {
                    cellBg = `rgba(239, 68, 68, ${Math.abs(val) * 0.45})`; // Red gradient
                }

                const cell = document.createElement("div");
                cell.style.width = "35px";
                cell.style.height = "35px";
                cell.style.background = cellBg;
                cell.style.display = "flex";
                cell.style.alignItems = "center";
                cell.style.justifyContent = "center";
                cell.style.borderRadius = "4px";
                cell.style.fontSize = "0.7rem";
                cell.style.fontFamily = "monospace";
                cell.style.border = "1px solid rgba(255,255,255,0.06)";
                cell.style.cursor = "pointer";
                cell.style.color = "#ffffff";
                cell.innerText = val.toFixed(1);

                // Attach Tooltip event listeners
                cell.addEventListener("mouseenter", () => {
                    const realStr = realVal.toFixed(3);
                    const imagSign = imagVal >= 0 ? "+" : "-";
                    const imagStr = Math.abs(imagVal).toFixed(3);
                    matrixTooltip.innerHTML = `W_8^(${k}×${n}) = W_8^(${(k*n)%8}) = ${realStr} ${imagSign} j${imagStr}`;
                    cell.style.borderColor = "var(--color-teal)";
                    cell.style.transform = "scale(1.05)";
                });

                cell.addEventListener("mouseleave", () => {
                    matrixTooltip.innerHTML = "Hover over matrix cells to inspect values";
                    cell.style.borderColor = "rgba(255,255,255,0.06)";
                    cell.style.transform = "none";
                });

                matrixGrid.appendChild(cell);
            }
        }
    }

    function calculateDFT() {
        const preset = selectPreset.value;

        // Hide/show preset control groups
        groupSine.style.display = (preset === "sine") ? "block" : "none";
        groupPulse.style.display = (preset === "pulse") ? "block" : "none";

        // Enable or disable manual inputs visually
        const isCustom = (preset === "custom");
        slidersX.forEach(slider => {
            slider.disabled = !isCustom;
            slider.style.opacity = isCustom ? "1.0" : "0.5";
        });

        // Values of x[n]
        const x = new Array(8).fill(0);

        if (preset === "sine") {
            const freq = parseInt(sliderFreq.value);
            valFreq.innerText = freq;
            for (let n = 0; n < 8; n++) {
                x[n] = Math.cos((2 * Math.PI * freq * n) / 8);
                slidersX[n].value = x[n].toFixed(2);
                valX[n].innerText = x[n].toFixed(1);
            }
        } else if (preset === "pulse") {
            const width = parseInt(sliderWidth.value);
            valWidth.innerText = width;
            for (let n = 0; n < 8; n++) {
                x[n] = (n < width) ? 1.0 : 0.0;
                slidersX[n].value = x[n].toFixed(2);
                valX[n].innerText = x[n].toFixed(1);
            }
        } else if (preset === "impulse") {
            for (let n = 0; n < 8; n++) {
                x[n] = (n === 0) ? 1.5 : 0.0;
                slidersX[n].value = x[n].toFixed(2);
                valX[n].innerText = x[n].toFixed(1);
            }
        } else {
            // Read directly from custom sliders
            for (let n = 0; n < 8; n++) {
                x[n] = parseFloat(slidersX[n].value);
                valX[n].innerText = x[n].toFixed(1);
            }
        }

        // Compute 8-point DFT: X[k] = sum(x[n] * e^-j2pi*k*n/8)
        const X_real = new Array(8).fill(0);
        const X_imag = new Array(8).fill(0);
        const X_mag = new Array(8).fill(0);

        for (let k = 0; k < 8; k++) {
            for (let n = 0; n < 8; n++) {
                const angle = (2 * Math.PI * k * n) / 8;
                X_real[k] += x[n] * Math.cos(angle);
                X_imag[k] += -x[n] * Math.sin(angle);
            }
            X_mag[k] = Math.sqrt(X_real[k] * X_real[k] + X_imag[k] * X_imag[k]);
        }

        // Draw plots
        drawInput(x);
        drawSpectrum(X_mag);
    }

    function drawInput(x) {
        const w = canvasIn.width / window.devicePixelRatio;
        const h = canvasIn.height / window.devicePixelRatio;
        ctxIn.clearRect(0, 0, w, h);

        const padX = 25;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;
        const axisY = h / 2;

        // Draw horizontal line y = 0
        ctxIn.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctxIn.lineWidth = 1;
        ctxIn.beginPath();
        ctxIn.moveTo(padX, axisY);
        ctxIn.lineTo(w - padX, axisY);
        ctxIn.stroke();

        // Draw stems
        for (let n = 0; n < 8; n++) {
            const val = x[n];
            const px = padX + (n / 7) * plotW;
            const py = axisY - (val / 2.2) * (plotH / 2); // input scaled to [-2.2, 2.2]

            ctxIn.strokeStyle = "#10b981"; // Green stems
            ctxIn.fillStyle = "#10b981";
            ctxIn.lineWidth = 1.8;

            // stem line
            ctxIn.beginPath();
            ctxIn.moveTo(px, axisY);
            ctxIn.lineTo(px, py);
            ctxIn.stroke();

            // dot
            ctxIn.beginPath();
            ctxIn.arc(px, py, 3, 0, 2 * Math.PI);
            ctxIn.fill();

            // Labels
            ctxIn.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctxIn.font = "8px Fira Code";
            ctxIn.textAlign = "center";
            ctxIn.fillText(n.toString(), px, axisY + 12);
        }

        // Axis labels
        ctxIn.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctxIn.font = "9px sans-serif";
        ctxIn.textAlign = "right";
        ctxIn.fillText("x[n]", w - padX, axisY - 8);
        ctxIn.textAlign = "left";
        ctxIn.fillText("n", w - padX + 5, axisY + 3);
    }

    function drawSpectrum(mag) {
        const w = canvasMag.width / window.devicePixelRatio;
        const h = canvasMag.height / window.devicePixelRatio;
        ctxMag.clearRect(0, 0, w, h);

        const padX = 25;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;
        const axisY = h - padY; // magnitudes are positive, so axis is at the bottom

        // Draw axis line
        ctxMag.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctxMag.lineWidth = 1;
        ctxMag.beginPath();
        ctxMag.moveTo(padX, axisY);
        ctxMag.lineTo(w - padX, axisY);
        ctxMag.stroke();

        // Get max magnitude to scale dynamically
        let maxVal = 1.0;
        mag.forEach(v => {
            if (v > maxVal) maxVal = v;
        });
        const scaleVal = maxVal * 1.1;

        // Draw stems
        for (let k = 0; k < 8; k++) {
            const val = mag[k];
            const px = padX + (k / 7) * plotW;
            const py = axisY - (val / scaleVal) * plotH;

            ctxMag.strokeStyle = "#0dd5c5"; // Teal stems
            ctxMag.fillStyle = "#0dd5c5";
            ctxMag.lineWidth = 1.8;

            ctxMag.beginPath();
            ctxMag.moveTo(px, axisY);
            ctxMag.lineTo(px, py);
            ctxMag.stroke();

            ctxMag.beginPath();
            ctxMag.arc(px, py, 3, 0, 2 * Math.PI);
            ctxMag.fill();

            // Labels
            ctxMag.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctxMag.font = "8px Fira Code";
            ctxMag.textAlign = "center";
            ctxMag.fillText(k.toString(), px, axisY + 12);
        }

        // Labels
        ctxMag.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctxMag.font = "9px sans-serif";
        ctxMag.textAlign = "right";
        ctxMag.fillText("|X[k]|", w - padX, padY + 10);
        ctxMag.textAlign = "left";
        ctxMag.fillText("k (bins)", w - padX + 5, axisY + 3);
    }

    // Attach listeners
    selectPreset.addEventListener("change", calculateDFT);
    sliderFreq.addEventListener("input", calculateDFT);
    sliderWidth.addEventListener("input", calculateDFT);
    matrixMode.addEventListener("change", initMatrixGrid);

    slidersX.forEach(slider => {
        slider.addEventListener("input", calculateDFT);
    });

    initMatrixGrid();
    calculateDFT();
}

// ============================================================================
// 15. Circular Shift & Convolution Simulator (Lecture 8)
// ============================================================================
function initDFTPropertiesSimulator() {
    const selectMode = document.getElementById("select-l8-mode");
    const sliderShift = document.getElementById("slider-l8-shift");
    const valShift = document.getElementById("val-l8-shift");
    const ctrlShift = document.getElementById("ctrl-l8-shift");
    const gridShift = document.getElementById("grid-l8-shift-mode");
    
    const sliderLength = document.getElementById("slider-l8-length");
    const valLength = document.getElementById("val-l8-length");
    const selectPreset = document.getElementById("select-l8-conv-preset");
    const ctrlConv = document.getElementById("ctrl-l8-conv");
    const gridConv = document.getElementById("grid-l8-conv-mode");
    
    const valInsight = document.getElementById("val-l8-insight");
    
    const canvasShiftOrig = document.getElementById("canvas-l8-shift-orig");
    const canvasShiftShifted = document.getElementById("canvas-l8-shift-shifted");
    
    const canvasConvInputs = document.getElementById("canvas-l8-conv-inputs");
    const canvasConvLinear = document.getElementById("canvas-l8-conv-linear");
    const canvasConvCircular = document.getElementById("canvas-l8-conv-circular");

    if (!canvasShiftOrig || !canvasShiftShifted || !canvasConvInputs || !canvasConvLinear || !canvasConvCircular) return;

    const ctxShiftOrig = canvasShiftOrig.getContext("2d");
    const ctxShiftShifted = canvasShiftShifted.getContext("2d");
    const ctxConvInputs = canvasConvInputs.getContext("2d");
    const ctxConvLinear = canvasConvLinear.getContext("2d");
    const ctxConvCircular = canvasConvCircular.getContext("2d");

    function resize() {
        const list = [
            { canvas: canvasShiftOrig, ctx: ctxShiftOrig, h: 180 },
            { canvas: canvasShiftShifted, ctx: ctxShiftShifted, h: 180 },
            { canvas: canvasConvInputs, ctx: ctxConvInputs, h: 180 },
            { canvas: canvasConvLinear, ctx: ctxConvLinear, h: 180 },
            { canvas: canvasConvCircular, ctx: ctxConvCircular, h: 180 }
        ];

        list.forEach(item => {
            item.canvas.width = item.canvas.parentElement.clientWidth * window.devicePixelRatio;
            item.canvas.height = item.h * window.devicePixelRatio;
            item.ctx.resetTransform();
            item.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        });
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const mode = selectMode.value;

        if (mode === "shift") {
            ctrlShift.style.display = "block";
            gridShift.style.display = "grid";
            ctrlConv.style.display = "none";
            gridConv.style.display = "none";

            drawShift();
        } else {
            ctrlShift.style.display = "none";
            gridShift.style.display = "none";
            ctrlConv.style.display = "flex";
            gridConv.style.display = "grid";

            drawConvolution();
        }
    }

    // ------------------------------------------------------------------------
    // A. CIRCULAR SHIFT SIMULATOR
    // ------------------------------------------------------------------------
    function drawShift() {
        const m = parseInt(sliderShift.value);
        valShift.innerText = m;

        const N = 8;
        const x_orig = [1.0, 1.5, 2.0, 1.5, 1.0, 0.5, 0.0, 0.0];
        const x_shifted = new Array(N).fill(0);

        for (let n = 0; n < N; n++) {
            let idx = (n - m) % N;
            if (idx < 0) idx += N;
            x_shifted[n] = x_orig[idx];
        }

        // Render Insight
        valInsight.innerHTML = `Circular Shift: x_c[n] = x[((n - ${m >= 0 ? m : "(" + m + ")"}))_8]. Fourier relation: X_c[k] = X[k] · e^{-j 2&pi; k (${m}) / 8}.`;

        const w = canvasShiftOrig.width / window.devicePixelRatio;
        const h = canvasShiftOrig.height / window.devicePixelRatio;

        // Draw original
        ctxShiftOrig.clearRect(0, 0, w, h);
        drawStems(ctxShiftOrig, x_orig, N, w, h, "#6366f1", "x[n]");

        // Draw shifted
        ctxShiftShifted.clearRect(0, 0, w, h);
        drawStems(ctxShiftShifted, x_shifted, N, w, h, "#10b981", `x[((n - ${m}))_8]`);
    }

    // ------------------------------------------------------------------------
    // B. CIRCULAR CONVOLUTION SIMULATOR
    // ------------------------------------------------------------------------
    function drawConvolution() {
        const N = parseInt(sliderLength.value);
        valLength.innerText = N;
        const preset = selectPreset.value;

        // Input signals are length 4
        let x1 = [1, 1, 1, 1];
        let x2 = [1, 1, 1, 1];

        if (preset === "sine-pulse") {
            x1 = [1.0, 0.0, -1.0, 0.0];
            x2 = [1.0, 1.0, 1.0, 1.0];
        } else if (preset === "impulse-ramp") {
            x1 = [1.5, 0.0, 0.0, 0.0];
            x2 = [0.2, 0.6, 1.0, 1.4];
        }

        // Zero-padded versions for circular convolution of length N
        const x1_pad = new Array(N).fill(0);
        const x2_pad = new Array(N).fill(0);
        for (let i = 0; i < 4; i++) {
            x1_pad[i] = x1[i];
            x2_pad[i] = x2[i];
        }

        // 1. Linear convolution of length 7
        const y_linear = new Array(7).fill(0);
        for (let n = 0; n < 7; n++) {
            for (let m = 0; m < 4; m++) {
                if (n - m >= 0 && n - m < 4) {
                    y_linear[n] += x1[m] * x2[n - m];
                }
            }
        }

        // 2. Circular convolution of length N
        const y_circular = new Array(N).fill(0);
        for (let n = 0; n < N; n++) {
            for (let m = 0; m < N; m++) {
                let idx = (n - m) % N;
                if (idx < 0) idx += N;
                y_circular[n] += x1_pad[m] * x2_pad[idx];
            }
        }

        // 3. Render Insight & Time Aliasing explanation
        let insight = "";
        if (N >= 7) {
            insight = `DFT length N = ${N} &ge; L + M - 1 = 7. Circular convolution matches linear convolution exactly (No Time-Domain Aliasing).`;
        } else {
            insight = `DFT length N = ${N} &lt; 7. Time aliasing occurs! Notice: y_circular[0] = y_linear[0] + y_linear[${N}] = ${y_linear[0].toFixed(2)} + ${(y_linear[N] || 0).toFixed(2)} = ${y_circular[0].toFixed(2)}.`;
        }
        valInsight.innerHTML = insight;

        // Draw plots
        const wIn = canvasConvInputs.width / window.devicePixelRatio;
        const hIn = canvasConvInputs.height / window.devicePixelRatio;
        ctxConvInputs.clearRect(0, 0, wIn, hIn);
        drawSuperimposedStems(ctxConvInputs, x1_pad, x2_pad, N, wIn, hIn);

        const wLin = canvasConvLinear.width / window.devicePixelRatio;
        const hLin = canvasConvLinear.height / window.devicePixelRatio;
        ctxConvLinear.clearRect(0, 0, wLin, hLin);
        drawStems(ctxConvLinear, y_linear, 7, wLin, hLin, "#8b5cf6", "y_linear[n]", true);

        const wCirc = canvasConvCircular.width / window.devicePixelRatio;
        const hCirc = canvasConvCircular.height / window.devicePixelRatio;
        ctxConvCircular.clearRect(0, 0, wCirc, hCirc);
        drawStems(ctxConvCircular, y_circular, N, wCirc, hCirc, N >= 7 ? "#0dd5c5" : "#ef4444", "y_circular[n]");
    }

    // Helper: Draw standard stem plot
    function drawStems(ctx, vals, N, w, h, color, labelY, isLinearScale = false) {
        const padX = 25;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;
        const axisY = h / 2;

        // Grid axis
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, axisY);
        ctx.lineTo(w - padX, axisY);
        ctx.stroke();

        // Get max magnitude to scale
        let maxVal = 1.0;
        vals.forEach(v => {
            if (Math.abs(v) > maxVal) maxVal = Math.abs(v);
        });

        const N_plot = isLinearScale ? 10 : N; // fixed scale for linear conv comparison

        for (let n = 0; n < vals.length; n++) {
            const val = vals[n];
            const px = padX + (n / (N_plot - 1 || 1)) * plotW;
            const py = axisY - (val / (maxVal * 1.1)) * (plotH / 2);

            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 1.8;

            // Stem
            ctx.beginPath();
            ctx.moveTo(px, axisY);
            ctx.lineTo(px, py);
            ctx.stroke();

            // Dot
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, 2 * Math.PI);
            ctx.fill();

            // Index
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.font = "8px Fira Code";
            ctx.textAlign = "center";
            ctx.fillText(n.toString(), px, axisY + 12);
        }

        // Labels
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(labelY, w - padX, axisY - 8);
        ctx.textAlign = "left";
        ctx.fillText("n", w - padX + 5, axisY + 3);
    }

    // Helper: Draw superimposed input signals x1[n] and x2[n]
    function drawSuperimposedStems(ctx, x1, x2, N, w, h) {
        const padX = 25;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;
        const axisY = h / 2;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, axisY);
        ctx.lineTo(w - padX, axisY);
        ctx.stroke();

        let maxVal = 1.0;
        x1.concat(x2).forEach(v => {
            if (Math.abs(v) > maxVal) maxVal = Math.abs(v);
        });

        for (let n = 0; n < N; n++) {
            const px = padX + (n / (N - 1 || 1)) * plotW;

            // Draw x1 (green) slightly shifted left
            const v1 = x1[n] || 0;
            const py1 = axisY - (v1 / (maxVal * 1.1)) * (plotH / 2);
            ctx.strokeStyle = "#10b981";
            ctx.fillStyle = "#10b981";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px - 2, axisY);
            ctx.lineTo(px - 2, py1);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(px - 2, py1, 2.5, 0, 2 * Math.PI);
            ctx.fill();

            // Draw x2 (purple/teal) slightly shifted right
            const v2 = x2[n] || 0;
            const py2 = axisY - (v2 / (maxVal * 1.1)) * (plotH / 2);
            ctx.strokeStyle = "#8b5cf6";
            ctx.fillStyle = "#8b5cf6";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px + 2, axisY);
            ctx.lineTo(px + 2, py2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(px + 2, py2, 2.5, 0, 2 * Math.PI);
            ctx.fill();

            // Index
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.font = "8px Fira Code";
            ctx.textAlign = "center";
            ctx.fillText(n.toString(), px, axisY + 12);
        }

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("x1 (grn), x2 (pur)", w - padX, axisY - 8);
    }

    // Listeners
    selectMode.addEventListener("change", draw);
    sliderShift.addEventListener("input", draw);
    sliderLength.addEventListener("input", draw);
    selectPreset.addEventListener("change", draw);

    draw();
}

// ============================================================================
// 16. DFT vs. FFT Complexity Simulator (Lecture 9)
// ============================================================================
function initComplexitySimulator() {
    const sliderN = document.getElementById("slider-l9-n");
    const valN = document.getElementById("val-l9-n");
    
    const valDftMult = document.getElementById("val-l9-dft-mult");
    const valFftMult = document.getElementById("val-l9-fft-mult");
    const valSpeedup = document.getElementById("val-l9-speedup");
    
    const valDftTime = document.getElementById("val-l9-dft-time");
    const valFftTime = document.getElementById("val-l9-fft-time");
    
    const canvas = document.getElementById("canvas-l9-chart");
    
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
        canvas.height = 260 * window.devicePixelRatio;
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function formatTime(t) {
        if (t < 0.000001) return (t * 1e9).toFixed(0) + " ns";
        if (t < 0.001) return (t * 1e6).toFixed(1) + " \u03bcs";
        if (t < 1.0) return (t * 1e3).toFixed(1) + " ms";
        return t.toFixed(2) + " s";
    }

    function draw() {
        const m = parseInt(sliderN.value);
        const N = Math.pow(2, m);
        
        valN.innerText = N;

        const dftMults = N * N;
        const fftMults = (N / 2) * m;
        const speedup = dftMults / fftMults;

        // Est time: assume 50ns per complex multiplication (which includes additions)
        // typical of modern hardware DSP performance
        const dftTime = dftMults * 50e-9;
        const fftTime = fftMults * 50e-9;

        // Update indicators
        valDftMult.innerText = dftMults.toLocaleString();
        valFftMult.innerText = fftMults.toLocaleString();
        valSpeedup.innerText = `${speedup.toFixed(1)}x faster`;
        
        valDftTime.innerText = formatTime(dftTime);
        valFftTime.innerText = formatTime(fftTime);

        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;

        ctx.clearRect(0, 0, w, h);

        const padX = 50;
        const padY = 40;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Draw horizontal baseline
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, h - padY);
        ctx.lineTo(w - padX, h - padY);
        ctx.stroke();

        // Logarithmic scale mapping
        // We will represent numbers from 10^0 (1) to 10^8 (100,000,000)
        const logMin = 0;
        const logMax = 8;
        function getPlotHeight(val) {
            const logVal = Math.log10(val || 1);
            const ratio = (logVal - logMin) / (logMax - logMin);
            return ratio * plotH;
        }

        // Draw log y-axis grid lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = "8px Fira Code";
        ctx.textAlign = "right";

        const logLabels = [10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];
        logLabels.forEach(labelVal => {
            const y = h - padY - getPlotHeight(labelVal);
            ctx.beginPath();
            ctx.moveTo(padX, y);
            ctx.lineTo(w - padX, y);
            ctx.stroke();
            ctx.fillText(labelVal.toLocaleString(), padX - 8, y + 3);
        });

        // Draw Bars
        const barW = Math.min(60, plotW / 3);
        const gap = (plotW - 2 * barW) / 3;

        // 1. DFT Bar (Red)
        const dftH = getPlotHeight(dftMults);
        const dftX = padX + gap;
        const dftY = h - padY - dftH;

        // Gradient fill for DFT
        const dftGrad = ctx.createLinearGradient(dftX, dftY, dftX, h - padY);
        dftGrad.addColorStop(0, "rgba(239, 68, 68, 0.85)");
        dftGrad.addColorStop(1, "rgba(239, 68, 68, 0.15)");
        ctx.fillStyle = dftGrad;
        ctx.fillRect(dftX, dftY, barW, dftH);

        // Border
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(dftX, dftY, barW, dftH);

        // Label count
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(dftMults.toLocaleString(), dftX + barW / 2, dftY - 8);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "9px sans-serif";
        ctx.fillText("Direct DFT", dftX + barW / 2, h - padY + 15);
        ctx.fillText(`(O(N\u00b2) = ${N}\u00b2)`, dftX + barW / 2, h - padY + 26);

        // 2. FFT Bar (Green)
        const fftH = getPlotHeight(fftMults);
        const fftX = padX + 2 * gap + barW;
        const fftY = h - padY - fftH;

        // Gradient fill for FFT
        const fftGrad = ctx.createLinearGradient(fftX, fftY, fftX, h - padY);
        fftGrad.addColorStop(0, "rgba(16, 185, 129, 0.85)");
        fftGrad.addColorStop(1, "rgba(16, 185, 129, 0.15)");
        ctx.fillStyle = fftGrad;
        ctx.fillRect(fftX, fftY, barW, fftH);

        // Border
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(fftX, fftY, barW, fftH);

        // Label count
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "bold 9px sans-serif";
        ctx.fillText(fftMults.toLocaleString(), fftX + barW / 2, fftY - 8);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "9px sans-serif";
        ctx.fillText("Radix-2 FFT", fftX + barW / 2, h - padY + 15);
        ctx.fillText(`(O(N log N))`, fftX + barW / 2, h - padY + 26);
    }

    sliderN.addEventListener("input", draw);
    draw();
}

// ============================================================================
// 17. FFT Butterfly & Bit-Reversal Simulator (Lecture 10)
// ============================================================================
// LECTURE 10: COMPLETE MULTI-STAGE RADIX-2 DIT-FFT BUTTERFLY & SFG SIMULATOR
// ============================================================================
function initFFTButterflySimulator() {
    let currentN = 8;
    let currentStageFocus = "all";
    let inputSignal = [1, 2, 3, 4, 4, 3, 2, 1];
    
    // DOM Elements
    const btnGroupN = document.getElementById("btn-group-l10-n");
    const selectPreset = document.getElementById("select-l10-preset");
    const selectStageFocus = document.getElementById("select-l10-stage-focus");
    const divCustomInput = document.getElementById("div-l10-custom-input");
    const inputCustomValues = document.getElementById("input-l10-custom-values");
    const btnApplyCustom = document.getElementById("btn-l10-apply-custom");
    
    const spanNVal = document.getElementById("span-l10-n-val");
    const spanStagesVal = document.getElementById("span-l10-stages-val");
    const spanButterfliesVal = document.getElementById("span-l10-butterflies-val");
    const stageSummaryBar = document.getElementById("l10-stage-summary-bar");
    
    const canvasSFG = document.getElementById("canvas-l10-sfg");
    const sfgScrollContainer = document.getElementById("l10-sfg-scroll-container");
    const tooltipNode = document.getElementById("l10-node-tooltip");
    
    const bitReversalContainer = document.getElementById("l10-bit-reversal-table-container");
    const spanBrN = document.getElementById("span-l10-br-n");
    
    // Micro 2-point butterfly elements
    const canvasMicro = document.getElementById("canvas-l10-butterfly");
    const sliderAr = document.getElementById("slider-l10-ar");
    const sliderAi = document.getElementById("slider-l10-ai");
    const sliderBr = document.getElementById("slider-l10-br");
    const sliderBi = document.getElementById("slider-l10-bi");
    const sliderR = document.getElementById("slider-l10-r");
    const valAr = document.getElementById("val-l10-ar");
    const valAi = document.getElementById("val-l10-ai");
    const valBr = document.getElementById("val-l10-br");
    const valBi = document.getElementById("val-l10-bi");
    const valR = document.getElementById("val-l10-r");
    
    if (!canvasSFG || !btnGroupN) return;
    
    const ctxSFG = canvasSFG.getContext("2d");
    const ctxMicro = canvasMicro ? canvasMicro.getContext("2d") : null;

    // Helper: Bit Reversal Calculation
    function getBitReversedIndex(n, bits) {
        let rev = 0;
        for (let i = 0; i < bits; i++) {
            rev = (rev << 1) | ((n >> i) & 1);
        }
        return rev;
    }

    function getBitReversalArray(N) {
        const bits = Math.round(Math.log2(N));
        const arr = [];
        for (let i = 0; i < N; i++) {
            arr.push(getBitReversedIndex(i, bits));
        }
        return arr;
    }

    // Helper: Complex Math
    function cAdd(a, b) { return { r: a.r + b.r, i: a.i + b.i }; }
    function cSub(a, b) { return { r: a.r - b.r, i: a.i - b.i }; }
    function cMult(a, b) { return { r: a.r * b.r - a.i * b.i, i: a.r * b.i + a.i * b.r }; }
    function cTwiddle(r, N) {
        const angle = -2 * Math.PI * r / N;
        return { r: Math.cos(angle), i: Math.sin(angle) };
    }
    function cFormat(c, precision = 2) {
        const rStr = Math.abs(c.r) < 0.001 ? "0" : c.r.toFixed(precision);
        const iAbs = Math.abs(c.i);
        const iStr = iAbs < 0.001 ? "0" : iAbs.toFixed(precision);
        if (iStr === "0") return rStr;
        if (rStr === "0") return `${c.i < 0 ? "-" : ""}j${iStr}`;
        return `${rStr}${c.i >= 0 ? "+" : "-"}j${iStr}`;
    }

    // Generate signal presets
    function generatePresetSignal(preset, N) {
        const sig = [];
        if (preset === "cosine") {
            for (let n = 0; n < N; n++) {
                sig.push(Number((1.0 + 2.0 * Math.cos(2 * Math.PI * n / N)).toFixed(2)));
            }
        } else if (preset === "delta") {
            for (let n = 0; n < N; n++) sig.push(n === 0 ? 1.0 : 0.0);
        } else if (preset === "step") {
            for (let n = 0; n < N; n++) sig.push(1.0);
        } else if (preset === "ramp") {
            for (let n = 0; n < N; n++) sig.push(n);
        } else if (preset === "symmetric") {
            if (N === 2) sig.push(1, 1);
            else if (N === 4) sig.push(1, 2, 2, 1);
            else if (N === 8) sig.push(1, 2, 3, 4, 4, 3, 2, 1);
            else if (N === 16) sig.push(1, 2, 3, 4, 5, 6, 7, 8, 8, 7, 6, 5, 4, 3, 2, 1);
        } else {
            for (let n = 0; n < N; n++) sig.push(n < inputSignal.length ? inputSignal[n] : 0.0);
        }
        return sig;
    }

    // Compute all intermediate stage states for DIT-FFT
    function computeDITStages(x, N) {
        const stages = Math.round(Math.log2(N));
        const br = getBitReversalArray(N);
        
        // Stage 0: Bit-reversed inputs
        const stageData = [];
        const stage0 = [];
        for (let i = 0; i < N; i++) {
            const val = x[br[i]] || 0;
            stage0.push({ r: val, i: 0, origIdx: br[i], bitRevPos: i });
        }
        stageData.push(stage0);

        // Compute subsequent stages
        for (let s = 1; s <= stages; s++) {
            const prev = stageData[s - 1];
            const curr = new Array(N);
            const L = Math.pow(2, s);     // Sub-DFT size: 2, 4, 8, 16
            const H = L / 2;             // Half-size
            const groups = N / L;

            for (let g = 0; g < groups; g++) {
                for (let b = 0; b < H; b++) {
                    const u = g * L + b;
                    const v = u + H;
                    const r = b * (N / L); // Twiddle factor exponent
                    const W = cTwiddle(r, N);
                    
                    const A = prev[u];
                    const B = prev[v];
                    const mult = cMult(B, W);
                    
                    curr[u] = { ...cAdd(A, mult), stage: s, group: g, branch: 'upper', pair: v, r: r, W: W };
                    curr[v] = { ...cSub(A, mult), stage: s, group: g, branch: 'lower', pair: u, r: r, W: W };
                }
            }
            stageData.push(curr);
        }
        return stageData;
    }

    // Render Stage Summary Badges
    function renderStageBadges(N) {
        stageSummaryBar.innerHTML = "";
        const stages = Math.round(Math.log2(N));
        
        // Input badge
        const inBadge = document.createElement("div");
        inBadge.style.background = "#1e293b";
        inBadge.style.border = "1px solid #475569";
        inBadge.style.padding = "4px 8px";
        inBadge.style.borderRadius = "4px";
        inBadge.style.color = "#94a3b8";
        inBadge.innerHTML = `<strong>Input:</strong> Bit-reversed \(x[n_{rev}]\)`;
        stageSummaryBar.appendChild(inBadge);

        for (let s = 1; s <= stages; s++) {
            const L = Math.pow(2, s);
            const groups = N / L;
            const twiddles = [];
            for (let b = 0; b < L / 2; b++) {
                twiddles.push(`W_${N}^${b * (N / L)}`);
            }
            
            const badge = document.createElement("div");
            badge.style.background = s % 2 === 1 ? "rgba(139, 92, 246, 0.15)" : "rgba(13, 213, 197, 0.15)";
            badge.style.border = s % 2 === 1 ? "1px solid rgba(139, 92, 246, 0.4)" : "1px solid rgba(13, 213, 197, 0.4)";
            badge.style.padding = "4px 8px";
            badge.style.borderRadius = "4px";
            badge.style.color = s % 2 === 1 ? "#c4b5fd" : "#6ee7b7";
            badge.innerHTML = `<strong>Stage ${s}:</strong> ${groups} &times; ${L}-pt Sub-DFTs (Twiddles: ${twiddles.join(", ")})`;
            stageSummaryBar.appendChild(badge);
        }

        const outBadge = document.createElement("div");
        outBadge.style.background = "rgba(16, 185, 129, 0.15)";
        outBadge.style.border = "1px solid #10b981";
        outBadge.style.padding = "4px 8px";
        outBadge.style.borderRadius = "4px";
        outBadge.style.color = "#6ee7b7";
        outBadge.innerHTML = `<strong>Output:</strong> Natural order \(X[k]\)`;
        stageSummaryBar.appendChild(outBadge);
    }

    // Render Bit Reversal Table
    function renderBitReversalTable(N) {
        if (!bitReversalContainer) return;
        const bits = Math.round(Math.log2(N));
        if (spanBrN) spanBrN.innerText = N;
        
        let html = `<table style="width:100%; border-collapse:collapse; font-size:0.75rem; font-family:monospace; text-align:center;">
            <thead>
                <tr style="background:#0f172a; color:#38bdf8;">
                    <th style="padding:6px; border:1px solid #1f2937;">Natural \(n\)</th>
                    <th style="padding:6px; border:1px solid #1f2937;">Binary (\(${bits}\)-bit)</th>
                    <th style="padding:6px; border:1px solid #1f2937;">Reversed Bits</th>
                    <th style="padding:6px; border:1px solid #1f2937;">Assigned Input \(x[n_{rev}]\)</th>
                    <th style="padding:6px; border:1px solid #1f2937;">Value</th>
                </tr>
            </thead>
            <tbody>`;
            
        for (let i = 0; i < N; i++) {
            const rev = getBitReversedIndex(i, bits);
            const binStr = i.toString(2).padStart(bits, '0');
            const revBinStr = rev.toString(2).padStart(bits, '0');
            const val = inputSignal[rev] !== undefined ? inputSignal[rev] : 0;
            const rowBg = i % 2 === 0 ? "#111827" : "#1e293b";
            
            html += `<tr style="background:${rowBg}; color:#e2e8f0;">
                <td style="padding:4px 6px; border:1px solid #1f2937;">${i}</td>
                <td style="padding:4px 6px; border:1px solid #1f2937; color:#94a3b8;">${binStr}</td>
                <td style="padding:4px 6px; border:1px solid #1f2937; color:#38bdf8;">${revBinStr}</td>
                <td style="padding:4px 6px; border:1px solid #1f2937; color:#a78bfa; font-weight:bold;">x[${rev}] (Pos ${i})</td>
                <td style="padding:4px 6px; border:1px solid #1f2937; color:#34d399;">${Number(val).toFixed(2)}</td>
            </tr>`;
        }
        html += `</tbody></table>`;
        bitReversalContainer.innerHTML = html;
    }

    // Draw the Complete Multi-Stage Signal Flow Graph
    function drawCompleteSFG() {
        const N = currentN;
        const stages = Math.round(Math.log2(N));
        const stageData = computeDITStages(inputSignal, N);
        
        spanNVal.innerText = N;
        spanStagesVal.innerText = stages;
        spanButterfliesVal.innerText = (N / 2) * stages;

        // Dimensions
        const rowHeight = N <= 4 ? 60 : (N <= 8 ? 44 : 32);
        const colWidth = N <= 4 ? 200 : (N <= 8 ? 160 : 135);
        const leftMargin = 110;
        const rightMargin = 130;
        const topMargin = 40;
        
        const totalW = leftMargin + stages * colWidth + rightMargin;
        const totalH = topMargin + N * rowHeight + 40;

        canvasSFG.width = totalW * window.devicePixelRatio;
        canvasSFG.height = totalH * window.devicePixelRatio;
        canvasSFG.style.width = `${totalW}px`;
        canvasSFG.style.height = `${totalH}px`;
        
        ctxSFG.resetTransform();
        ctxSFG.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctxSFG.clearRect(0, 0, totalW, totalH);

        // Stage column headers
        ctxSFG.font = "bold 11px sans-serif";
        ctxSFG.textAlign = "center";
        
        ctxSFG.fillStyle = "#94a3b8";
        ctxSFG.fillText("Inputs x[n_rev]", leftMargin / 2, 20);
        
        for (let s = 1; s <= stages; s++) {
            const x = leftMargin + (s - 0.5) * colWidth;
            const isFocused = currentStageFocus === "all" || currentStageFocus === String(s);
            ctxSFG.fillStyle = isFocused ? "#38bdf8" : "#475569";
            ctxSFG.fillText(`Stage ${s} (${Math.pow(2, s)}-pt DFTs)`, x, 20);
        }
        
        ctxSFG.fillStyle = "#10b981";
        ctxSFG.fillText("Outputs X[k]", totalW - rightMargin / 2, 20);

        // Draw Sub-DFT Grouping Bounding Boxes
        for (let s = 1; s <= stages; s++) {
            const L = Math.pow(2, s);
            const groups = N / L;
            const isFocused = currentStageFocus === "all" || currentStageFocus === String(s);
            const boxX = leftMargin + (s - 1) * colWidth + 10;
            const boxW = colWidth - 20;

            for (let g = 0; g < groups; g++) {
                const startY = topMargin + (g * L) * rowHeight - 6;
                const boxH = L * rowHeight - rowHeight + 12;
                
                ctxSFG.fillStyle = isFocused 
                    ? (s % 2 === 1 ? "rgba(139, 92, 246, 0.06)" : "rgba(13, 213, 197, 0.06)")
                    : "rgba(255, 255, 255, 0.01)";
                ctxSFG.strokeStyle = isFocused 
                    ? (s % 2 === 1 ? "rgba(139, 92, 246, 0.35)" : "rgba(13, 213, 197, 0.35)")
                    : "rgba(255, 255, 255, 0.05)";
                ctxSFG.lineWidth = 1;
                ctxSFG.setLineDash([4, 4]);
                ctxSFG.strokeRect(boxX, startY, boxW, boxH);
                ctxSFG.fillRect(boxX, startY, boxW, boxH);
                ctxSFG.setLineDash([]);

                // Label sub-DFT box
                if (isFocused && rowHeight >= 32) {
                    ctxSFG.font = "9px Fira Code, monospace";
                    ctxSFG.fillStyle = s % 2 === 1 ? "rgba(167, 139, 250, 0.8)" : "rgba(52, 211, 153, 0.8)";
                    ctxSFG.textAlign = "right";
                    ctxSFG.fillText(`${L}-pt DFT #${g+1}`, boxX + boxW - 4, startY + 12);
                }
            }
        }

        // Draw Horizontal Rails
        for (let i = 0; i < N; i++) {
            const y = topMargin + i * rowHeight;
            ctxSFG.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctxSFG.lineWidth = 1.5;
            ctxSFG.beginPath();
            ctxSFG.moveTo(leftMargin - 15, y);
            ctxSFG.lineTo(totalW - rightMargin + 15, y);
            ctxSFG.stroke();
        }

        // Draw Butterflies Stage by Stage
        for (let s = 1; s <= stages; s++) {
            const L = Math.pow(2, s);
            const H = L / 2;
            const groups = N / L;
            const isFocused = currentStageFocus === "all" || currentStageFocus === String(s);
            const startX = leftMargin + (s - 1) * colWidth;
            const endX = startX + colWidth;

            for (let g = 0; g < groups; g++) {
                for (let b = 0; b < H; b++) {
                    const u = g * L + b;
                    const v = u + H;
                    const yU = topMargin + u * rowHeight;
                    const yV = topMargin + v * rowHeight;
                    const r = b * (N / L);

                    const alpha = isFocused ? 1.0 : 0.2;

                    // Upper branch diagonal (crossing to bottom)
                    ctxSFG.strokeStyle = `rgba(139, 92, 246, ${alpha})`; // Purple
                    ctxSFG.lineWidth = 1.8;
                    ctxSFG.beginPath();
                    ctxSFG.moveTo(startX + 20, yU);
                    ctxSFG.lineTo(endX - 25, yV);
                    ctxSFG.stroke();

                    // Lower branch diagonal (crossing to top)
                    ctxSFG.strokeStyle = `rgba(13, 213, 197, ${alpha})`; // Teal
                    ctxSFG.beginPath();
                    ctxSFG.moveTo(startX + 45, yV);
                    ctxSFG.lineTo(endX - 25, yU);
                    ctxSFG.stroke();

                    // Twiddle multiplier dot on lower branch
                    const multX = startX + 32;
                    ctxSFG.fillStyle = `rgba(245, 158, 11, ${alpha})`;
                    ctxSFG.beginPath();
                    ctxSFG.arc(multX, yV, 5, 0, 2 * Math.PI);
                    ctxSFG.fill();

                    // Twiddle Label
                    if (isFocused) {
                        ctxSFG.fillStyle = "#f59e0b";
                        ctxSFG.font = "bold 9px Fira Code, monospace";
                        ctxSFG.textAlign = "center";
                        ctxSFG.fillText(`W${N}^${r}`, multX, yV + (rowHeight > 36 ? 14 : -8));
                    }

                    // Branch Multipliers: -1 marker on lower output
                    if (isFocused) {
                        ctxSFG.font = "bold 9px sans-serif";
                        ctxSFG.fillStyle = "#ef4444";
                        ctxSFG.textAlign = "right";
                        ctxSFG.fillText("-1", endX - 30, yV - 4);

                        ctxSFG.fillStyle = "#10b981";
                        ctxSFG.fillText("+1", endX - 30, yU - 4);
                    }
                }
            }
        }

        // Draw Nodes & Text Values
        for (let s = 0; s <= stages; s++) {
            const x = s === 0 ? leftMargin : (leftMargin + s * colWidth);
            const isFocused = s === 0 || currentStageFocus === "all" || currentStageFocus === String(s) || currentStageFocus === String(s+1);
            
            for (let i = 0; i < N; i++) {
                const y = topMargin + i * rowHeight;
                const nodeVal = stageData[s][i];
                
                // Draw node circle
                ctxSFG.fillStyle = s === stages ? "#10b981" : (s === 0 ? "#38bdf8" : "#818cf8");
                ctxSFG.beginPath();
                ctxSFG.arc(x, y, 4.5, 0, 2 * Math.PI);
                ctxSFG.fill();

                // Node value text above node
                if (isFocused && rowHeight >= 32) {
                    ctxSFG.font = "8px Fira Code, monospace";
                    ctxSFG.fillStyle = s === stages ? "#6ee7b7" : "#cbd5e1";
                    ctxSFG.textAlign = "center";
                    ctxSFG.fillText(cFormat(nodeVal, 1), x, y - 8);
                }
            }
        }

        // Draw Left Input Labels
        const brArr = getBitReversalArray(N);
        ctxSFG.textAlign = "right";
        for (let i = 0; i < N; i++) {
            const y = topMargin + i * rowHeight;
            const orig = brArr[i];
            const val = inputSignal[orig] !== undefined ? inputSignal[orig] : 0;
            
            ctxSFG.font = "bold 10px Fira Code, monospace";
            ctxSFG.fillStyle = "#38bdf8";
            ctxSFG.fillText(`x[${orig}]`, leftMargin - 35, y + 3);
            
            ctxSFG.font = "9px monospace";
            ctxSFG.fillStyle = "#94a3b8";
            ctxSFG.fillText(`(${orig.toString(2).padStart(Math.log2(N), '0')})`, leftMargin - 12, y + 3);
        }

        // Draw Right Output Labels & Magnitude
        ctxSFG.textAlign = "left";
        const finalStage = stageData[stages];
        for (let k = 0; k < N; k++) {
            const y = topMargin + k * rowHeight;
            const Xk = finalStage[k];
            const mag = Math.sqrt(Xk.r * Xk.r + Xk.i * Xk.i);
            
            ctxSFG.font = "bold 10px Fira Code, monospace";
            ctxSFG.fillStyle = "#10b981";
            ctxSFG.fillText(`X[${k}] = ${cFormat(Xk, 2)}`, totalW - rightMargin + 15, y + 3);
            
            // Draw mini magnitude bar
            const barW = Math.min(30, (mag / (N * 2)) * 30);
            ctxSFG.fillStyle = "rgba(16, 185, 129, 0.4)";
            ctxSFG.fillRect(totalW - 35, y - 4, barW, 8);
        }
    }

    // Draw Isolated 2-Point Micro Butterfly
    function drawMicroButterfly() {
        if (!canvasMicro || !ctxMicro) return;
        const Ar = parseFloat(sliderAr.value);
        const Ai = parseFloat(sliderAi.value);
        const Br = parseFloat(sliderBr.value);
        const Bi = parseFloat(sliderBi.value);
        const r = parseInt(sliderR.value);

        valAr.innerText = Ar.toFixed(1);
        valAi.innerText = Ai.toFixed(1);
        valBr.innerText = Br.toFixed(1);
        valBi.innerText = Bi.toFixed(1);
        valR.innerText = r;

        // Twiddle W_N^r
        const W = cTwiddle(r, currentN);
        const mult = cMult({ r: Br, i: Bi }, W);
        const outA = cAdd({ r: Ar, i: Ai }, mult);
        const outB = cSub({ r: Ar, i: Ai }, mult);

        const w = canvasMicro.clientWidth;
        const h = canvasMicro.clientHeight;
        canvasMicro.width = w * window.devicePixelRatio;
        canvasMicro.height = h * window.devicePixelRatio;
        ctxMicro.resetTransform();
        ctxMicro.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctxMicro.clearRect(0, 0, w, h);

        const y1 = 30;
        const y2 = 110;
        const startX = 65;
        const endX = w - 85;

        // Rails
        ctxMicro.strokeStyle = "rgba(255,255,255,0.15)";
        ctxMicro.lineWidth = 1.8;
        ctxMicro.beginPath();
        ctxMicro.moveTo(startX, y1); ctxMicro.lineTo(endX, y1);
        ctxMicro.moveTo(startX, y2); ctxMicro.lineTo(endX, y2);
        ctxMicro.stroke();

        // Diagonals
        ctxMicro.strokeStyle = "#8b5cf6";
        ctxMicro.beginPath();
        ctxMicro.moveTo(startX + 30, y1); ctxMicro.lineTo(endX - 25, y2);
        ctxMicro.stroke();

        ctxMicro.strokeStyle = "#0dd5c5";
        ctxMicro.beginPath();
        ctxMicro.moveTo(startX + 55, y2); ctxMicro.lineTo(endX - 25, y1);
        ctxMicro.stroke();

        // Twiddle multiplier
        const multX = startX + 40;
        ctxMicro.fillStyle = "#f59e0b";
        ctxMicro.beginPath();
        ctxMicro.arc(multX, y2, 5, 0, 2*Math.PI);
        ctxMicro.fill();
        ctxMicro.font = "bold 9px Fira Code";
        ctxMicro.textAlign = "center";
        ctxMicro.fillText(`\u00d7 W${currentN}^${r}`, multX, y2 + 16);

        // Branch signs
        ctxMicro.font = "bold 9px sans-serif";
        ctxMicro.fillStyle = "#10b981"; ctxMicro.textAlign = "right"; ctxMicro.fillText("+1", endX - 30, y1 - 4);
        ctxMicro.fillStyle = "#ef4444"; ctxMicro.fillText("-1", endX - 30, y2 - 4);

        // Inputs
        ctxMicro.textAlign = "right";
        ctxMicro.font = "9px Fira Code";
        ctxMicro.fillStyle = "#38bdf8";
        ctxMicro.fillText(`A: ${cFormat({r: Ar, i: Ai}, 1)}`, startX - 8, y1 + 3);
        ctxMicro.fillText(`B: ${cFormat({r: Br, i: Bi}, 1)}`, startX - 8, y2 + 3);

        // Outputs
        ctxMicro.textAlign = "left";
        ctxMicro.fillStyle = "#10b981";
        ctxMicro.fillText(`A+W·B = ${cFormat(outA, 2)}`, endX + 8, y1 + 3);
        ctxMicro.fillStyle = "#ef4444";
        ctxMicro.fillText(`A-W·B = ${cFormat(outB, 2)}`, endX + 8, y2 + 3);
    }

    function updateAll() {
        renderStageBadges(currentN);
        renderBitReversalTable(currentN);
        drawCompleteSFG();
        drawMicroButterfly();
    }

    // Event Handlers for N Selection
    document.querySelectorAll(".l10-n-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            document.querySelectorAll(".l10-n-btn").forEach(b => {
                b.classList.remove("active", "btn-primary");
                b.classList.add("btn-outline-primary");
            });
            this.classList.add("active", "btn-primary");
            this.classList.remove("btn-outline-primary");
            
            currentN = parseInt(this.getAttribute("data-n"));
            sliderR.max = currentN - 1;
            
            // Re-populate stage focus dropdown
            const stages = Math.round(Math.log2(currentN));
            selectStageFocus.innerHTML = '<option value="all" selected>All Stages (Full SFG)</option>';
            for (let s = 1; s <= stages; s++) {
                const opt = document.createElement("option");
                opt.value = s;
                opt.innerText = `Stage ${s} (${Math.pow(2, s)}-pt Sub-DFTs)`;
                selectStageFocus.appendChild(opt);
            }
            currentStageFocus = "all";

            inputSignal = generatePresetSignal(selectPreset.value, currentN);
            updateAll();
        });
    });

    // Preset selector
    selectPreset.addEventListener("change", function() {
        if (this.value === "custom") {
            divCustomInput.style.display = "block";
        } else {
            divCustomInput.style.display = "none";
            inputSignal = generatePresetSignal(this.value, currentN);
            updateAll();
        }
    });

    // Custom input apply
    btnApplyCustom.addEventListener("click", function() {
        const raw = inputCustomValues.value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        if (raw.length > 0) {
            inputSignal = [];
            for (let i = 0; i < currentN; i++) {
                inputSignal.push(i < raw.length ? raw[i] : 0);
            }
            updateAll();
        }
    });

    // Stage focus dropdown
    selectStageFocus.addEventListener("change", function() {
        currentStageFocus = this.value;
        drawCompleteSFG();
    });

    // Micro butterfly sliders
    sliderAr.addEventListener("input", drawMicroButterfly);
    sliderAi.addEventListener("input", drawMicroButterfly);
    sliderBr.addEventListener("input", drawMicroButterfly);
    sliderBi.addEventListener("input", drawMicroButterfly);
    sliderR.addEventListener("input", drawMicroButterfly);

    // Initial setup
    inputSignal = generatePresetSignal("cosine", currentN);
    updateAll();
    window.addEventListener("resize", drawCompleteSFG);
}

// ============================================================================
// 18. DIT vs. DIF Butterfly Comparison Simulator (Lecture 11)
// ============================================================================
function initDIFSimulator() {
    const sliderAr = document.getElementById("slider-l11-ar");
    const sliderAi = document.getElementById("slider-l11-ai");
    const sliderBr = document.getElementById("slider-l11-br");
    const sliderBi = document.getElementById("slider-l11-bi");
    const sliderR = document.getElementById("slider-l11-r");
    
    const valAr = document.getElementById("val-l11-ar");
    const valAi = document.getElementById("val-l11-ai");
    const valBr = document.getElementById("val-l11-br");
    const valBi = document.getElementById("val-l11-bi");
    const valR = document.getElementById("val-l11-r");
    
    const canvasDit = document.getElementById("canvas-l11-dit");
    const canvasDif = document.getElementById("canvas-l11-dif");

    if (!canvasDit || !canvasDif) return;

    const ctxDit = canvasDit.getContext("2d");
    const ctxDif = canvasDif.getContext("2d");

    function resize() {
        const list = [
            { canvas: canvasDit, ctx: ctxDit },
            { canvas: canvasDif, ctx: ctxDif }
        ];
        list.forEach(item => {
            item.canvas.width = item.canvas.parentElement.clientWidth * window.devicePixelRatio;
            item.canvas.height = 180 * window.devicePixelRatio;
            item.ctx.resetTransform();
            item.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        });
    }
    resize();
    window.addEventListener("resize", resize);

    function formatComplex(r, i) {
        const sign = i >= 0 ? "+" : "-";
        return `${r.toFixed(2)}${sign}j${Math.abs(i).toFixed(2)}`;
    }

    function draw() {
        const Ar = parseFloat(sliderAr.value);
        const Ai = parseFloat(sliderAi.value);
        const Br = parseFloat(sliderBr.value);
        const Bi = parseFloat(sliderBi.value);
        const r = parseInt(sliderR.value);

        valAr.innerText = Ar.toFixed(1);
        valAi.innerText = Ai.toFixed(1);
        valBr.innerText = Br.toFixed(1);
        valBi.innerText = Bi.toFixed(1);
        valR.innerText = r;

        // Compute Twiddle Factor
        const angle = -2 * Math.PI * r / 8;
        const Wr = Math.cos(angle);
        const Wi = Math.sin(angle);

        // -------------------------------------------------------------
        // DIT Drawing & Math
        // -------------------------------------------------------------
        // B * W
        const ditMultR = Br * Wr - Bi * Wi;
        const ditMultI = Br * Wi + Bi * Wr;
        // outputs
        const ditX_r = Ar + ditMultR;
        const ditX_i = Ai + ditMultI;
        const ditY_r = Ar - ditMultR;
        const ditY_i = Ai - ditMultI;

        drawDitButterfly(Ar, Ai, Br, Bi, r, Wr, Wi, ditX_r, ditX_i, ditY_r, ditY_i);

        // -------------------------------------------------------------
        // DIF Drawing & Math
        // -------------------------------------------------------------
        // outputs
        const difX_r = Ar + Br;
        const difX_i = Ai + Bi;
        const difDiffR = Ar - Br;
        const difDiffI = Ai - Bi;
        // (A - B) * W
        const difY_r = difDiffR * Wr - difDiffI * Wi;
        const difY_i = difDiffR * Wi + difDiffI * Wr;

        drawDifButterfly(Ar, Ai, Br, Bi, r, Wr, Wi, difX_r, difX_i, difY_r, difY_i);
    }

    function drawDitButterfly(Ar, Ai, Br, Bi, r, Wr, Wi, Xr, Xi, Yr, Yi) {
        const w = canvasDit.width / window.devicePixelRatio;
        const h = canvasDit.height / window.devicePixelRatio;
        ctxDit.clearRect(0, 0, w, h);

        const y1 = 40;
        const y2 = 130;
        const startX = 65;
        const endX = w - 85;

        // Paths
        ctxDit.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctxDit.lineWidth = 1.8;
        
        ctxDit.beginPath();
        ctxDit.moveTo(startX, y1);
        ctxDit.lineTo(endX, y1);
        ctxDit.stroke();

        ctxDit.beginPath();
        ctxDit.moveTo(startX, y2);
        ctxDit.lineTo(endX, y2);
        ctxDit.stroke();

        // Diagonals
        ctxDit.strokeStyle = "#8b5cf6";
        ctxDit.beginPath();
        ctxDit.moveTo(startX + 35, y1);
        ctxDit.lineTo(endX - 25, y2);
        ctxDit.stroke();

        ctxDit.strokeStyle = "#0dd5c5";
        ctxDit.beginPath();
        ctxDit.moveTo(startX + 65, y2);
        ctxDit.lineTo(endX - 25, y1);
        ctxDit.stroke();

        // Twiddle mult circle (DIT: before adders on B branch)
        const multX = startX + 45;
        ctxDit.fillStyle = "#f59e0b";
        ctxDit.beginPath();
        ctxDit.arc(multX, y2, 5, 0, 2 * Math.PI);
        ctxDit.fill();

        // Labels
        ctxDit.fillStyle = "#e2e8f0";
        ctxDit.font = "8px Fira Code";
        ctxDit.textAlign = "right";
        ctxDit.fillText(`A: ${Ar.toFixed(1)}${Ai >= 0 ? "+" : "-"}j${Math.abs(Ai).toFixed(1)}`, startX - 8, y1 + 3);
        ctxDit.fillText(`B: ${Br.toFixed(1)}${Bi >= 0 ? "+" : "-"}j${Math.abs(Bi).toFixed(1)}`, startX - 8, y2 + 3);

        ctxDit.fillStyle = "#f59e0b";
        ctxDit.font = "8px sans-serif";
        ctxDit.textAlign = "center";
        ctxDit.fillText(`\u00d7 W8^${r}`, multX, y2 - 10);

        ctxDit.fillStyle = "#ef4444";
        ctxDit.font = "bold 8px sans-serif";
        ctxDit.textAlign = "right";
        ctxDit.fillText("-1", endX - 28, y2 - 6);

        // Summation circles
        ctxDit.fillStyle = "#3b82f6";
        ctxDit.beginPath();
        ctxDit.arc(endX - 15, y1, 6, 0, 2 * Math.PI);
        ctxDit.arc(endX - 15, y2, 6, 0, 2 * Math.PI);
        ctxDit.fill();

        // Output Labels
        ctxDit.textAlign = "left";
        ctxDit.font = "8px Fira Code";
        ctxDit.fillStyle = "#10b981";
        ctxDit.fillText(`A+W8^r B:`, endX + 3, y1 - 4);
        ctxDit.fillText(`${formatComplex(Xr, Xi)}`, endX + 3, y1 + 6);
        ctxDit.fillStyle = "#ef4444";
        ctxDit.fillText(`A-W8^r B:`, endX + 3, y2 - 4);
        ctxDit.fillText(`${formatComplex(Yr, Yi)}`, endX + 3, y2 + 6);
    }

    function drawDifButterfly(Ar, Ai, Br, Bi, r, Wr, Wi, Xr, Xi, Yr, Yi) {
        const w = canvasDif.width / window.devicePixelRatio;
        const h = canvasDif.height / window.devicePixelRatio;
        ctxDif.clearRect(0, 0, w, h);

        const y1 = 40;
        const y2 = 130;
        const startX = 65;
        const endX = w - 85;

        // Paths
        ctxDif.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctxDif.lineWidth = 1.8;
        
        ctxDif.beginPath();
        ctxDif.moveTo(startX, y1);
        ctxDif.lineTo(endX, y1);
        ctxDif.stroke();

        ctxDif.beginPath();
        ctxDif.moveTo(startX, y2);
        ctxDif.lineTo(endX, y2);
        ctxDif.stroke();

        // Diagonals (DIF: cross connection happens BEFORE multiplier)
        ctxDif.strokeStyle = "#8b5cf6";
        ctxDif.beginPath();
        ctxDit.moveTo(startX + 30, y1);
        ctxDif.lineTo(startX + 75, y2);
        ctxDif.stroke();

        ctxDif.strokeStyle = "#0dd5c5";
        ctxDif.beginPath();
        ctxDif.moveTo(startX + 30, y2);
        ctxDif.lineTo(startX + 75, y1);
        ctxDif.stroke();

        // Summation circles (DIF: placed at the cross inputs junction)
        ctxDif.fillStyle = "#3b82f6";
        ctxDif.beginPath();
        ctxDif.arc(startX + 75, y1, 6, 0, 2 * Math.PI);
        ctxDif.arc(startX + 75, y2, 6, 0, 2 * Math.PI);
        ctxDif.fill();

        // Twiddle mult circle (DIF: after adder on lower output branch)
        const multX = endX - 45;
        ctxDif.fillStyle = "#f59e0b";
        ctxDif.beginPath();
        ctxDif.arc(multX, y2, 5, 0, 2 * Math.PI);
        ctxDif.fill();

        // Labels
        ctxDif.fillStyle = "#e2e8f0";
        ctxDif.font = "8px Fira Code";
        ctxDif.textAlign = "right";
        ctxDif.fillText(`A: ${Ar.toFixed(1)}${Ai >= 0 ? "+" : "-"}j${Math.abs(Ai).toFixed(1)}`, startX - 8, y1 + 3);
        ctxDif.fillText(`B: ${Br.toFixed(1)}${Bi >= 0 ? "+" : "-"}j${Math.abs(Bi).toFixed(1)}`, startX - 8, y2 + 3);

        ctxDif.fillStyle = "#f59e0b";
        ctxDif.font = "8px sans-serif";
        ctxDif.textAlign = "center";
        ctxDif.fillText(`\u00d7 W8^${r}`, multX, y2 - 10);

        ctxDif.fillStyle = "#ef4444";
        ctxDif.font = "bold 8px sans-serif";
        ctxDif.textAlign = "right";
        ctxDif.fillText("-1", startX + 70, y2 - 6);

        // Output Labels
        ctxDif.textAlign = "left";
        ctxDif.font = "8px Fira Code";
        ctxDif.fillStyle = "#10b981";
        ctxDif.fillText(`A+B:`, endX + 3, y1 - 4);
        ctxDif.fillText(`${formatComplex(Xr, Xi)}`, endX + 3, y1 + 6);
        ctxDif.fillStyle = "#ef4444";
        ctxDif.fillText(`(A-B)W8^r:`, endX + 3, y2 - 4);
        ctxDif.fillText(`${formatComplex(Yr, Yi)}`, endX + 3, y2 + 6);
    }

    sliderAr.addEventListener("input", draw);
    sliderAi.addEventListener("input", draw);
    sliderBr.addEventListener("input", draw);
    sliderBi.addEventListener("input", draw);
    sliderR.addEventListener("input", draw);

    draw();
}

// ============================================================================
// 19. Radix-4 FFT Simulator (Lecture 12)
// ============================================================================
function initRadix4Simulator() {
    const sliders = {
        ar: document.getElementById("slider-l12-ar"),
        ai: document.getElementById("slider-l12-ai"),
        br: document.getElementById("slider-l12-br"),
        bi: document.getElementById("slider-l12-bi"),
        cr: document.getElementById("slider-l12-cr"),
        ci: document.getElementById("slider-l12-ci"),
        dr: document.getElementById("slider-l12-dr"),
        di: document.getElementById("slider-l12-di")
    };

    const vals = {
        ar: document.getElementById("val-l12-ar"),
        ai: document.getElementById("val-l12-ai"),
        br: document.getElementById("val-l12-br"),
        bi: document.getElementById("val-l12-bi"),
        cr: document.getElementById("val-l12-cr"),
        ci: document.getElementById("val-l12-ci"),
        dr: document.getElementById("val-l12-dr"),
        di: document.getElementById("val-l12-di")
    };

    const outs = {
        x0: document.getElementById("val-l12-x0"),
        x1: document.getElementById("val-l12-x1"),
        x2: document.getElementById("val-l12-x2"),
        x3: document.getElementById("val-l12-x3")
    };

    const gridContainer = document.getElementById("l12-matrix-grid-container");
    const tooltip = document.getElementById("l12-matrix-tooltip");

    if (!sliders.ar || !gridContainer || !tooltip) return;

    // Define 4x4 matrix values: row-major order
    // 0: 1, 1: -1, 2: j, 3: -j
    const matrix = [
        [{ r: 1, i: 0 }, { r: 1, i: 0 }, { r: 1, i: 0 }, { r: 1, i: 0 }],
        [{ r: 1, i: 0 }, { r: 0, i: -1 }, { r: -1, i: 0 }, { r: 0, i: 1 }],
        [{ r: 1, i: 0 }, { r: -1, i: 0 }, { r: 1, i: 0 }, { r: -1, i: 0 }],
        [{ r: 1, i: 0 }, { r: 0, i: 1 }, { r: -1, i: 0 }, { r: 0, i: -1 }]
    ];

    function formatComplex(r, i) {
        const sign = i >= 0 ? "+" : "-";
        return `${r.toFixed(2)}${sign}j${Math.abs(i).toFixed(2)}`;
    }

    function formatMatrixCell(cell) {
        if (cell.r === 1 && cell.i === 0) return "1";
        if (cell.r === -1 && cell.i === 0) return "-1";
        if (cell.r === 0 && cell.i === 1) return "j";
        if (cell.r === 0 && cell.i === -1) return "-j";
        return "";
    }

    function update() {
        // Read input complex numbers
        const A = { r: parseFloat(sliders.ar.value), i: parseFloat(sliders.ai.value) };
        const B = { r: parseFloat(sliders.br.value), i: parseFloat(sliders.bi.value) };
        const C = { r: parseFloat(sliders.cr.value), i: parseFloat(sliders.ci.value) };
        const D = { r: parseFloat(sliders.dr.value), i: parseFloat(sliders.di.value) };

        // Update slider label texts
        vals.ar.innerText = A.r.toFixed(1);
        vals.ai.innerText = A.i.toFixed(1);
        vals.br.innerText = B.r.toFixed(1);
        vals.bi.innerText = B.i.toFixed(1);
        vals.cr.innerText = C.r.toFixed(1);
        vals.ci.innerText = C.i.toFixed(1);
        vals.dr.innerText = D.r.toFixed(1);
        vals.di.innerText = D.i.toFixed(1);

        // Perform matrix calculations
        // Row 0: A + B + C + D
        const X0 = {
            r: A.r + B.r + C.r + D.r,
            i: A.i + B.i + C.i + D.i
        };
        // Row 1: A - jB - C + jD
        const X1 = {
            r: A.r + B.i - C.r - D.i,
            i: A.i - B.r - C.i + D.r
        };
        // Row 2: A - B + C - D
        const X2 = {
            r: A.r - B.r + C.r - D.r,
            i: A.i - B.i + C.i - D.i
        };
        // Row 3: A + jB - C - jD
        const X3 = {
            r: A.r - B.i - C.r + D.i,
            i: A.i + B.r - C.i - D.r
        };

        // Render Outputs
        outs.x0.innerText = formatComplex(X0.r, X0.i);
        outs.x1.innerText = formatComplex(X1.r, X1.i);
        outs.x2.innerText = formatComplex(X2.r, X2.i);
        outs.x3.innerText = formatComplex(X3.r, X3.i);

        // Render hoverable grid
        gridContainer.innerHTML = "";
        const inputs = [A, B, C, D];
        const inputNames = ["A", "B", "C", "D"];

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const cellVal = matrix[row][col];
                const cellInput = inputs[col];
                
                // Multiply cell matrix factor by input vector
                // (cellVal.r + j cellVal.i) * (cellInput.r + j cellInput.i)
                const termR = cellVal.r * cellInput.r - cellVal.i * cellInput.i;
                const termI = cellVal.r * cellInput.i + cellVal.i * cellInput.r;

                const gridItem = document.createElement("div");
                gridItem.style.background = "#1f2937";
                gridItem.style.border = "1px solid rgba(255,255,255,0.08)";
                gridItem.style.color = "white";
                gridItem.style.padding = "10px 4px";
                gridItem.style.borderRadius = "4px";
                gridItem.style.textAlign = "center";
                gridItem.style.cursor = "pointer";
                gridItem.style.fontFamily = "monospace";
                gridItem.style.fontSize = "0.9rem";
                gridItem.style.transition = "all 0.2s ease";

                gridItem.innerText = formatMatrixCell(cellVal);

                // Highlight diagonal cells
                if (row === col) {
                    gridItem.style.borderColor = "rgba(13, 213, 197, 0.4)";
                }

                gridItem.addEventListener("mouseenter", () => {
                    gridItem.style.background = "rgba(13, 213, 197, 0.15)";
                    gridItem.style.borderColor = "var(--color-teal)";
                    tooltip.innerHTML = `Bin k=${row}, Input ${inputNames[col]}: (${formatMatrixCell(cellVal)}) \u00d7 (${formatComplex(cellInput.r, cellInput.i)}) = <strong>${formatComplex(termR, termI)}</strong>`;
                });

                gridItem.addEventListener("mouseleave", () => {
                    gridItem.style.background = "#1f2937";
                    gridItem.style.borderColor = row === col ? "rgba(13, 213, 197, 0.4)" : "rgba(255,255,255,0.08)";
                    tooltip.innerHTML = "Hover over cells to see calculations";
                });

                gridContainer.appendChild(gridItem);
            }
        }
    }

    Object.values(sliders).forEach(slider => {
        slider.addEventListener("input", update);
    });

    update();
}

// ============================================================================
// 20. Overlap-Add Block Convolution Simulator (Lecture 13)
// ============================================================================
function initOverlapAddSimulator() {
    const sliderL = document.getElementById("slider-l13-l");
    const valL = document.getElementById("val-l13-l");
    const selectFilter = document.getElementById("select-l13-filter");
    const valMathDetails = document.getElementById("val-l13-math-details");
    
    const canvasBlocks = document.getElementById("canvas-l13-blocks");
    const canvasCombined = document.getElementById("canvas-l13-combined");

    if (!canvasBlocks || !canvasCombined) return;

    const ctxBlocks = canvasBlocks.getContext("2d");
    const ctxCombined = canvasCombined.getContext("2d");

    function resize() {
        const list = [
            { canvas: canvasBlocks, ctx: ctxBlocks },
            { canvas: canvasCombined, ctx: ctxCombined }
        ];
        list.forEach(item => {
            item.canvas.width = item.canvas.parentElement.clientWidth * window.devicePixelRatio;
            item.canvas.height = 200 * window.devicePixelRatio;
            item.ctx.resetTransform();
            item.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        });
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const L = parseInt(sliderL.value);
        valL.innerText = L;
        const filterType = selectFilter.value;

        // Long input sequence x[n] (length 10)
        const x = [1.0, 1.2, 0.8, 0.5, 0.2, 0.5, 0.9, 1.1, 0.7, 0.4];
        
        // Filter tap parameters (M = 3)
        let h = [0.33, 0.33, 0.33];
        if (filterType === "diff") {
            h = [1.0, -1.0, 0.0];
        } else if (filterType === "decay") {
            h = [1.0, 0.5, 0.2];
        }

        const M = 3;
        const N = L + M - 1;
        const K = Math.ceil(x.length / L); // Number of blocks

        valMathDetails.innerHTML = `Block length L = ${L}, Filter size M = 3. Circular DFT padding size N = L + M - 1 = ${N}. Overlap = ${M - 1} samples.`;

        // 1. Compute convolved blocks and reconstruct output
        const blockOutputs = [];
        const y_reconstructed = new Array(x.length + M - 1).fill(0);

        for (let i = 0; i < K; i++) {
            const startIdx = i * L;
            const x_block = new Array(L).fill(0);
            for (let j = 0; j < L; j++) {
                if (startIdx + j < x.length) {
                    x_block[j] = x[startIdx + j];
                }
            }

            // Linear convolution of block (length L) with filter h (length M)
            const blockConv = new Array(N).fill(0);
            for (let n = 0; n < N; n++) {
                for (let k = 0; k < L; k++) {
                    if (n - k >= 0 && n - k < M) {
                        blockConv[n] += x_block[k] * h[n - k];
                    }
                }
            }

            blockOutputs.push({ offset: startIdx, vals: blockConv });

            // Add into reconstruction buffer
            for (let j = 0; j < N; j++) {
                if (startIdx + j < y_reconstructed.length) {
                    y_reconstructed[startIdx + j] += blockConv[j];
                }
            }
        }

        // Draw individual convolved blocks
        drawIndividualBlocks(ctxBlocks, blockOutputs, x.length + M - 1, L, M);

        // Draw combined reconstructed signal
        drawCombinedStems(ctxCombined, y_reconstructed, L, M);
    }

    function drawIndividualBlocks(ctx, blocks, totalLen, L, M) {
        const w = canvasBlocks.width / window.devicePixelRatio;
        const h = canvasBlocks.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        const padX = 30;
        const padY = 25;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;
        const axisY = h / 2;

        // Draw horizontal line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, axisY);
        ctx.lineTo(w - padX, axisY);
        ctx.stroke();

        // Get max magnitude to scale
        let maxVal = 1.0;
        blocks.forEach(b => {
            b.vals.forEach(v => {
                if (Math.abs(v) > maxVal) maxVal = Math.abs(v);
            });
        });

        // Color palette for blocks
        const colors = ["#0dd5c5", "#8b5cf6", "#3b82f6", "#ec4899"];

        // Highlight overlap regions
        ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
        for (let i = 1; i < blocks.length; i++) {
            const startIdx = i * L;
            const endIdx = startIdx + (M - 1);
            
            const pxStart = padX + (startIdx / (totalLen - 1)) * plotW;
            const pxEnd = padX + (endIdx / (totalLen - 1)) * plotW;
            
            ctx.fillRect(pxStart, padY, pxEnd - pxStart, plotH);

            // Shading border
            ctx.strokeStyle = "rgba(245, 158, 11, 0.2)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pxStart, padY);
            ctx.lineTo(pxStart, padY + plotH);
            ctx.moveTo(pxEnd, padY);
            ctx.lineTo(pxEnd, padY + plotH);
            ctx.stroke();
        }

        // Draw stems
        blocks.forEach((block, blockIdx) => {
            const color = colors[blockIdx % colors.length];
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 1.5;

            block.vals.forEach((val, valIdx) => {
                const idx = block.offset + valIdx;
                const px = padX + (idx / (totalLen - 1)) * plotW;
                const py = axisY - (val / (maxVal * 1.1)) * (plotH / 2);

                // Stem
                ctx.beginPath();
                ctx.moveTo(px, axisY);
                ctx.lineTo(px, py);
                ctx.stroke();

                // Dot
                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
                ctx.fill();

                // Label index for first block or overlap references
                ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctx.font = "7px Fira Code";
                ctx.textAlign = "center";
                ctx.fillText(idx.toString(), px, axisY + 11);
            });
        });

        // Legend/Axis Labels
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Blocks: B1(Teal), B2(Purple), B3(Blue)", padX, padY - 8);
    }

    function drawCombinedStems(ctx, vals, L, M) {
        const w = canvasCombined.width / window.devicePixelRatio;
        const h = canvasCombined.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        const padX = 30;
        const padY = 25;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;
        const axisY = h / 2;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, axisY);
        ctx.lineTo(w - padX, axisY);
        ctx.stroke();

        let maxVal = 1.0;
        vals.forEach(v => {
            if (Math.abs(v) > maxVal) maxVal = Math.abs(v);
        });

        for (let n = 0; n < vals.length; n++) {
            const val = vals[n];
            const px = padX + (n / (vals.length - 1)) * plotW;
            const py = axisY - (val / (maxVal * 1.1)) * (plotH / 2);

            // If it falls within an overlap-added region, color it gold/orange
            const isOverlap = (n > 0) && (n % L < M - 1) && (n < vals.length - (M - 1));

            ctx.strokeStyle = isOverlap ? "#f59e0b" : "#3b82f6";
            ctx.fillStyle = isOverlap ? "#f59e0b" : "#3b82f6";
            ctx.lineWidth = 1.8;

            // Stem
            ctx.beginPath();
            ctx.moveTo(px, axisY);
            ctx.lineTo(px, py);
            ctx.stroke();

            // Dot
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, 2 * Math.PI);
            ctx.fill();

            // Index
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.font = "8px Fira Code";
            ctx.textAlign = "center";
            ctx.fillText(n.toString(), px, axisY + 12);
        }

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("y[n] (linear convolution result)", w - padX, padY - 8);
    }

    sliderL.addEventListener("input", draw);
    selectFilter.addEventListener("change", draw);

    draw();
}

// ============================================================================
// 21. Overlap-Save Block Convolution Simulator (Lecture 14)
// ============================================================================
function initOverlapSaveSimulator() {
    const sliderL = document.getElementById("slider-l14-l");
    const valL = document.getElementById("val-l14-l");
    const selectFilter = document.getElementById("select-l14-filter");
    const valMathDetails = document.getElementById("val-l14-math-details");
    
    const canvasBlocks = document.getElementById("canvas-l14-blocks");
    const canvasCombined = document.getElementById("canvas-l14-combined");

    if (!canvasBlocks || !canvasCombined) return;

    const ctxBlocks = canvasBlocks.getContext("2d");
    const ctxCombined = canvasCombined.getContext("2d");

    function resize() {
        const list = [
            { canvas: canvasBlocks, ctx: ctxBlocks },
            { canvas: canvasCombined, ctx: ctxCombined }
        ];
        list.forEach(item => {
            item.canvas.width = item.canvas.parentElement.clientWidth * window.devicePixelRatio;
            item.canvas.height = 200 * window.devicePixelRatio;
            item.ctx.resetTransform();
            item.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        });
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const L = parseInt(sliderL.value);
        valL.innerText = L;
        const filterType = selectFilter.value;

        // Long input sequence x[n] (length 10)
        const x = [1.0, 1.2, 0.8, 0.5, 0.2, 0.5, 0.9, 1.1, 0.7, 0.4];
        
        // Filter tap parameters (M = 3)
        let h = [0.33, 0.33, 0.33];
        if (filterType === "diff") {
            h = [1.0, -1.0, 0.0];
        } else if (filterType === "decay") {
            h = [1.0, 0.5, 0.2];
        }

        const M = 3;
        const N = L + M - 1;
        const K = Math.ceil(x.length / L); // Number of blocks

        valMathDetails.innerHTML = `Input overlap = ${M - 1} samples. Circular DFT size N = L + M - 1 = ${N}. Output Discarded = ${M - 1} samples, Saved = ${L} samples.`;

        // 1. Process blocks
        const blockOutputs = [];
        const y_reconstructed = [];

        // Pad h to size N for circular convolution
        const h_padded = new Array(N).fill(0);
        for (let j = 0; j < M; j++) {
            h_padded[j] = h[j];
        }

        for (let i = 0; i < K; i++) {
            const startIdx = i * L - (M - 1);
            const x_block = new Array(N).fill(0);
            
            for (let j = 0; j < N; j++) {
                const globalIdx = startIdx + j;
                if (globalIdx >= 0 && globalIdx < x.length) {
                    x_block[j] = x[globalIdx];
                }
            }

            // Circular convolution of x_block (size N) and h_padded (size N)
            const blockConv = new Array(N).fill(0);
            for (let n = 0; n < N; n++) {
                for (let k = 0; k < N; k++) {
                    const h_idx = (n - k + N) % N;
                    blockConv[n] += x_block[k] * h_padded[h_idx];
                }
            }

            blockOutputs.push({ offset: i * L, vals: blockConv });

            // Save the valid L samples (from index M-1 to N-1)
            for (let j = M - 1; j < N; j++) {
                y_reconstructed.push(blockConv[j]);
            }
        }

        // Limit reconstructed length to actual linear output size
        const targetLen = x.length + M - 1;
        while (y_reconstructed.length > targetLen) {
            y_reconstructed.pop();
        }

        // Draw blocks with discarded zones
        drawOutputBlocks(ctxBlocks, blockOutputs, L, M);

        // Draw combined output
        drawConcatenatedStems(ctxCombined, y_reconstructed, L, M);
    }

    function drawOutputBlocks(ctx, blocks, L, M) {
        const w = canvasBlocks.width / window.devicePixelRatio;
        const h = canvasBlocks.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        const padX = 35;
        const padY = 25;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;
        const axisY = h / 2;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, axisY);
        ctx.lineTo(w - padX, axisY);
        ctx.stroke();

        let maxVal = 1.0;
        blocks.forEach(b => {
            b.vals.forEach(v => {
                if (Math.abs(v) > maxVal) maxVal = Math.abs(v);
            });
        });

        // We will plot the blocks side by side or layered.
        // Let's plot them offset horizontally to see them clearly.
        const numBlocks = blocks.length;
        const blockSpacing = plotW / numBlocks;

        blocks.forEach((block, blockIdx) => {
            const blockStartX = padX + blockIdx * blockSpacing;
            const blockWidth = blockSpacing - 15;
            const N = block.vals.length;

            // Draw background labels
            ctx.fillStyle = "rgba(255,255,255,0.05)";
            ctx.fillRect(blockStartX, padY, blockWidth, plotH);
            
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "8px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`Block ${blockIdx + 1}`, blockStartX + blockWidth / 2, padY - 8);

            // Shading for Discarded Region (first M-1 samples)
            const discardWidth = ((M - 1) / N) * blockWidth;
            ctx.fillStyle = "rgba(239, 68, 68, 0.08)";
            ctx.fillRect(blockStartX, padY, discardWidth, plotH);

            // Shading for Saved Region (remaining L samples)
            ctx.fillStyle = "rgba(16, 185, 129, 0.05)";
            ctx.fillRect(blockStartX + discardWidth, padY, blockWidth - discardWidth, plotH);

            // Draw stems
            block.vals.forEach((val, valIdx) => {
                const px = blockStartX + (valIdx / (N - 1)) * blockWidth;
                const py = axisY - (val / (maxVal * 1.1)) * (plotH / 2);

                const isDiscarded = valIdx < M - 1;
                ctx.strokeStyle = isDiscarded ? "#ef4444" : "#10b981";
                ctx.fillStyle = isDiscarded ? "#ef4444" : "#10b981";
                ctx.lineWidth = 1.5;

                // Stem
                ctx.beginPath();
                ctx.moveTo(px, axisY);
                ctx.lineTo(px, py);
                ctx.stroke();

                // Dot
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, 2 * Math.PI);
                ctx.fill();

                // Small index inside block
                ctx.fillStyle = "rgba(255,255,255,0.2)";
                ctx.font = "6px Fira Code";
                ctx.fillText(valIdx.toString(), px, axisY + 9);
            });
        });
    }

    function drawConcatenatedStems(ctx, vals, L, M) {
        const w = canvasCombined.width / window.devicePixelRatio;
        const h = canvasCombined.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        const padX = 35;
        const padY = 25;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;
        const axisY = h / 2;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, axisY);
        ctx.lineTo(w - padX, axisY);
        ctx.stroke();

        let maxVal = 1.0;
        vals.forEach(v => {
            if (Math.abs(v) > maxVal) maxVal = Math.abs(v);
        });

        // Draw boundary concatenation lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.setLineDash([3, 3]);
        for (let i = 1; i * L < vals.length; i++) {
            const px = padX + ((i * L) / (vals.length - 1)) * plotW;
            ctx.beginPath();
            ctx.moveTo(px, padY);
            ctx.lineTo(px, padY + plotH);
            ctx.stroke();
        }
        ctx.setLineDash([]); // Reset dash

        for (let n = 0; n < vals.length; n++) {
            const val = vals[n];
            const px = padX + (n / (vals.length - 1)) * plotW;
            const py = axisY - (val / (maxVal * 1.1)) * (plotH / 2);

            ctx.strokeStyle = "#10b981";
            ctx.fillStyle = "#10b981";
            ctx.lineWidth = 1.8;

            // Stem
            ctx.beginPath();
            ctx.moveTo(px, axisY);
            ctx.lineTo(px, py);
            ctx.stroke();

            // Dot
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, 2 * Math.PI);
            ctx.fill();

            // Index
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.font = "8px Fira Code";
            ctx.textAlign = "center";
            ctx.fillText(n.toString(), px, axisY + 12);
        }

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("y[n] (linear convolution result)", w - padX, padY - 8);
    }

    sliderL.addEventListener("input", draw);
    selectFilter.addEventListener("change", draw);

    draw();
}

// ============================================================================
// 22. Filter Quantization Simulator (Lecture 15)
// ============================================================================
function initQuantizationSimulator() {
    const sliders = {
        h0: document.getElementById("slider-l15-h0"),
        h1: document.getElementById("slider-l15-h1"),
        h2: document.getElementById("slider-l15-h2")
    };

    const vals = {
        h0: document.getElementById("val-l15-h0"),
        h1: document.getElementById("val-l15-h1"),
        h2: document.getElementById("val-l15-h2")
    };

    const selectPrecision = document.getElementById("select-l15-precision");
    const valDirect = document.getElementById("val-l15-direct-coeff");
    const valCascade = document.getElementById("val-l15-cascade-coeff");
    const canvas = document.getElementById("canvas-l15-quantization");

    if (!sliders.h0 || !canvas) return;

    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
        canvas.height = 250 * window.devicePixelRatio;
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function quantize(val, bits) {
        if (bits === "double") return val;
        const b = parseInt(bits);
        // Max range is +/- 2.0. Map to fit in b-bit signed representation.
        const maxVal = 2.0;
        const levels = Math.pow(2, b - 1) - 1;
        const temp = Math.round((val / maxVal) * levels);
        // Clamp to avoid overflow of levels
        const clamped = Math.max(-levels, Math.min(levels, temp));
        return (clamped / levels) * maxVal;
    }

    function calculateResponse(h, numPoints = 120) {
        const mag = [];
        for (let i = 0; i < numPoints; i++) {
            const w = (i / (numPoints - 1)) * Math.PI;
            // H(e^jw) = h[0] + h[1]e^-jw + h[2]e^-2jw
            const real = h[0] + h[1] * Math.cos(-w) + h[2] * Math.cos(-2 * w);
            const imag = h[1] * Math.sin(-w) + h[2] * Math.sin(-2 * w);
            mag.push(Math.sqrt(real * real + imag * imag));
        }
        return mag;
    }

    function draw() {
        const h0 = parseFloat(sliders.h0.value);
        const h1 = parseFloat(sliders.h1.value);
        const h2 = parseFloat(sliders.h2.value);
        const bits = selectPrecision.value;

        vals.h0.innerText = h0.toFixed(1);
        vals.h1.innerText = h1.toFixed(1);
        vals.h2.innerText = h2.toFixed(1);

        // Ideal coefficients
        const h_ideal = [h0, h1, h2];

        // 1. Direct-Form Quantization: quantize h coefficients directly
        const h_direct = [
            quantize(h0, bits),
            quantize(h1, bits),
            quantize(h2, bits)
        ];

        // 2. Cascade-Form Quantization:
        // System function is H(z) = h0(1 + beta1*z^-1 + beta2*z^-2)
        // Quantize gain h0 and SOS coefficients beta1, beta2 separately.
        const gain = h0;
        const beta1 = h0 !== 0 ? h1 / h0 : 0;
        const beta2 = h0 !== 0 ? h2 / h0 : 0;

        const gain_q = quantize(gain, bits);
        const beta1_q = quantize(beta1, bits);
        const beta2_q = quantize(beta2, bits);

        const h_cascade = [
            gain_q,
            gain_q * beta1_q,
            gain_q * beta2_q
        ];

        // Display Quantized values in text
        valDirect.innerText = `h = [${h_direct[0].toFixed(3)}, ${h_direct[1].toFixed(3)}, ${h_direct[2].toFixed(3)}]`;

        // Calculate zeros (roots) of the filter
        // h0 z^2 + h1 z + h2 = 0
        const D = h1 * h1 - 4 * h0 * h2;
        if (h0 === 0) {
            valCascade.innerText = "h[0] is zero (1st order filter)";
        } else if (D >= 0) {
            const z1 = (-h1 + Math.sqrt(D)) / (2 * h0);
            const z2 = (-h1 - Math.sqrt(D)) / (2 * h0);
            valCascade.innerText = `Real roots: z1 = ${z1.toFixed(2)}, z2 = ${z2.toFixed(2)}`;
        } else {
            const realPart = -h1 / (2 * h0);
            const imagPart = Math.sqrt(-D) / (2 * h0);
            valCascade.innerText = `Complex zeros: z = ${realPart.toFixed(2)} \u00b1 j${imagPart.toFixed(2)}`;
        }

        // Plot Frequency Response Magnitude
        const numPoints = 120;
        const magIdeal = calculateResponse(h_ideal, numPoints);
        const magDirect = calculateResponse(h_direct, numPoints);
        const magCascade = calculateResponse(h_cascade, numPoints);

        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        const padX = 40;
        const padY = 25;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Draw grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        
        // Horizontal gridlines
        for (let i = 0; i <= 4; i++) {
            const y = padY + (i / 4) * plotH;
            ctx.beginPath();
            ctx.moveTo(padX, y);
            ctx.lineTo(w - padX, y);
            ctx.stroke();

            // Amplitude Label
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.font = "8px monospace";
            ctx.textAlign = "right";
            const valLabel = (4.0 * (1 - i / 4)).toFixed(1);
            ctx.fillText(valLabel, padX - 5, y + 3);
        }

        // Vertical gridlines
        for (let i = 0; i <= 4; i++) {
            const x = padX + (i / 4) * plotW;
            ctx.beginPath();
            ctx.moveTo(x, padY);
            ctx.lineTo(x, padY + plotH);
            ctx.stroke();

            // Frequency Labels
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.font = "8px monospace";
            ctx.textAlign = "center";
            const labels = ["0", "\u03c0/4", "\u03c0/2", "3\u03c0/4", "\u03c0"];
            ctx.fillText(labels[i], x, padY + plotH + 12);
        }

        // Draw curves
        // Ideal: Cyan
        drawCurve(ctx, magIdeal, plotW, plotH, padX, padY, "#3b82f6", 2.2, false);
        // Direct-Form: Red
        drawCurve(ctx, magDirect, plotW, plotH, padX, padY, "#ef4444", 1.8, bits !== "double");
        // Cascade-Form: Green
        drawCurve(ctx, magCascade, plotW, plotH, padX, padY, "#10b981", 1.8, bits !== "double");

        // Axis Titles
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Normalized Frequency (radians)", padX + plotW / 2, padY + plotH + 28);
    }

    function drawCurve(ctx, mag, plotW, plotH, padX, padY, color, width, dash = false) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        if (dash) {
            ctx.setLineDash([4, 3]);
        } else {
            ctx.setLineDash([]);
        }

        ctx.beginPath();
        for (let i = 0; i < mag.length; i++) {
            const px = padX + (i / (mag.length - 1)) * plotW;
            // Max amplitude scaling to 4.0
            const val = Math.min(4.0, mag[i]);
            const py = padY + plotH - (val / 4.0) * plotH;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset
    }

    Object.values(sliders).forEach(slider => {
        slider.addEventListener("input", draw);
    });
    selectPrecision.addEventListener("change", draw);

    draw();
}

// ============================================================================
// 23. Frequency-Sampling Filter Simulator (Lecture 16)
// ============================================================================
function initFreqSamplingSimulator() {
    const sliders = {
        r: document.getElementById("slider-l16-r"),
        h0: document.getElementById("slider-l16-h0"),
        h1: document.getElementById("slider-l16-h1"),
        h2: document.getElementById("slider-l16-h2"),
        h3: document.getElementById("slider-l16-h3"),
        h4: document.getElementById("slider-l16-h4")
    };

    const vals = {
        r: document.getElementById("val-l16-r"),
        h0: document.getElementById("val-l16-h0"),
        h1: document.getElementById("val-l16-h1"),
        h2: document.getElementById("val-l16-h2"),
        h3: document.getElementById("val-l16-h3"),
        h4: document.getElementById("val-l16-h4")
    };

    const valMathDetails = document.getElementById("val-l16-math-details");
    const canvasZ = document.getElementById("canvas-l16-zplane");
    const canvasR = document.getElementById("canvas-l16-response");

    if (!canvasZ || !canvasR) return;

    const ctxZ = canvasZ.getContext("2d");
    const ctxR = canvasR.getContext("2d");

    function resize() {
        canvasZ.width = canvasZ.parentElement.clientWidth * window.devicePixelRatio;
        canvasZ.height = 180 * window.devicePixelRatio;
        ctxZ.resetTransform();
        ctxZ.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasR.width = canvasR.parentElement.clientWidth * window.devicePixelRatio;
        canvasR.height = 180 * window.devicePixelRatio;
        ctxR.resetTransform();
        ctxR.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function evalComplex(w, r, H) {
        const N = 8;
        const z = { r: Math.cos(w), i: Math.sin(w) };
        const z_inv = { r: z.r, i: -z.i };
        const z_inv_N = { r: Math.cos(-N * w), i: Math.sin(-N * w) };

        // Comb filter: Hc = (1 - r^N z^-N) / N
        const Hc = {
            r: (1 - Math.pow(r, N) * z_inv_N.r) / N,
            i: (-Math.pow(r, N) * z_inv_N.i) / N
        };

        let Hp_r = 0;
        let Hp_i = 0;

        for (let k = 0; k < N; k++) {
            const theta = (2 * Math.PI * k) / N;
            // pole = r * e^(j theta)
            const pole = { r: r * Math.cos(theta), i: r * Math.sin(theta) };
            
            // term = pole * z^-1
            const term = {
                r: pole.r * z_inv.r - pole.i * z_inv.i,
                i: pole.r * z_inv.i + pole.i * z_inv.r
            };
            
            // denom = 1 - term
            const denom = { r: 1 - term.r, i: -term.i };
            const denom_mag2 = denom.r * denom.r + denom.i * denom.i;

            if (denom_mag2 > 1e-9) {
                Hp_r += (H[k] * denom.r) / denom_mag2;
                Hp_i += (H[k] * -denom.i) / denom_mag2;
            }
        }

        const H_r = Hc.r * Hp_r - Hc.i * Hp_i;
        const H_i = Hc.r * Hp_i + Hc.i * Hp_r;

        return Math.sqrt(H_r * H_r + H_i * H_i);
    }

    function draw() {
        const r = parseFloat(sliders.r.value);
        const h0 = parseFloat(sliders.h0.value);
        const h1 = parseFloat(sliders.h1.value);
        const h2 = parseFloat(sliders.h2.value);
        const h3 = parseFloat(sliders.h3.value);
        const h4 = parseFloat(sliders.h4.value);

        vals.r.innerText = r.toFixed(2);
        vals.h0.innerText = h0.toFixed(1);
        vals.h1.innerText = h1.toFixed(1);
        vals.h2.innerText = h2.toFixed(1);
        vals.h3.innerText = h3.toFixed(1);
        vals.h4.innerText = h4.toFixed(1);

        // Symmetric frequency samples N=8: [H0, H1, H2, H3, H4, H3, H2, H1]
        const H = [h0, h1, h2, h3, h4, h3, h2, h1];

        valMathDetails.innerHTML = `Comb filter zeros radius = ${r.toFixed(2)}. Resonator poles radius = ${r.toFixed(2)}.<br>Active Resonators: ${H.filter(v => v > 0).length} of 8 channels.`;

        // 1. Draw Z-Plane
        drawZPlane(ctxZ, r, H);

        // 2. Draw Frequency Response Magnitude
        drawFrequencyResponse(ctxR, r, H);
    }

    function drawZPlane(ctx, r, H) {
        const w = canvasZ.width / window.devicePixelRatio;
        const h = canvasZ.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(cx, cy) - 20;

        // Draw axes
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - radius - 10, cy);
        ctx.lineTo(cx + radius + 10, cy);
        ctx.moveTo(cx, cy - radius - 10);
        ctx.lineTo(cx, cy + radius + 10);
        ctx.stroke();

        // Draw Unit Circle
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.stroke();

        const N = 8;
        for (let k = 0; k < N; k++) {
            const angle = (2 * Math.PI * k) / N;
            
            // Draw Zero (Comb Zeros): circles 'o' at radius r
            const zx = cx + r * radius * Math.cos(angle);
            const zy = cy - r * radius * Math.sin(angle);
            
            ctx.strokeStyle = "#0dd5c5";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(zx, zy, 4, 0, 2 * Math.PI);
            ctx.stroke();

            // Draw Pole (Resonator Poles): crosses 'x' at radius r (only if active H[k] > 0)
            if (H[k] > 0) {
                ctx.strokeStyle = "#8b5cf6";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(zx - 3, zy - 3);
                ctx.lineTo(zx + 3, zy + 3);
                ctx.moveTo(zx + 3, zy - 3);
                ctx.lineTo(zx - 3, zy + 3);
                ctx.stroke();
            }
        }
    }

    function drawFrequencyResponse(ctx, r, H) {
        const w = canvasR.width / window.devicePixelRatio;
        const h = canvasR.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        const padX = 35;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Draw grid
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 2; i++) {
            const y = padY + (i / 2) * plotH;
            ctx.beginPath();
            ctx.moveTo(padX, y);
            ctx.lineTo(w - padX, y);
            ctx.stroke();
        }
        for (let i = 0; i <= 4; i++) {
            const x = padX + (i / 4) * plotW;
            ctx.beginPath();
            ctx.moveTo(x, padY);
            ctx.lineTo(x, padY + plotH);
            ctx.stroke();

            // Labels
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "8px monospace";
            ctx.textAlign = "center";
            const labels = ["0", "\u03c0/4", "\u03c0/2", "3\u03c0/4", "\u03c0"];
            ctx.fillText(labels[i], x, padY + plotH + 11);
        }

        // Calculate points
        const numPoints = 120;
        const response = [];
        let maxVal = 0.5;

        for (let i = 0; i < numPoints; i++) {
            const freq = (i / (numPoints - 1)) * Math.PI;
            const val = evalComplex(freq, r, H);
            response.push(val);
            if (val > maxVal) maxVal = val;
        }

        // Draw response curve
        ctx.strokeStyle = "#8b5cf6";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < response.length; i++) {
            const px = padX + (i / (response.length - 1)) * plotW;
            // Max amplitude scaling
            const val = response[i];
            const py = padY + plotH - (val / (maxVal * 1.1)) * plotH;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
    }

    Object.values(sliders).forEach(slider => {
        slider.addEventListener("input", draw);
    });

    draw();
}

// ============================================================================
// 24. IIR Realization & Stability Simulator (Lecture 17)
// ============================================================================
function initIIRSimulator() {
    const sliders = {
        b0: document.getElementById("slider-l17-b0"),
        b1: document.getElementById("slider-l17-b1"),
        b2: document.getElementById("slider-l17-b2"),
        a1: document.getElementById("slider-l17-a1"),
        a2: document.getElementById("slider-l17-a2")
    };

    const vals = {
        b0: document.getElementById("val-l17-b0"),
        b1: document.getElementById("val-l17-b1"),
        b2: document.getElementById("val-l17-b2"),
        a1: document.getElementById("val-l17-a1"),
        a2: document.getElementById("val-l17-a2")
    };

    const selectForm = document.getElementById("select-l17-form");
    const valStats = document.getElementById("val-l17-stats");
    const canvasSFG = document.getElementById("canvas-l17-sfg");
    const canvasImpulse = document.getElementById("canvas-l17-impulse");

    if (!canvasSFG || !canvasImpulse) return;

    const ctxSFG = canvasSFG.getContext("2d");
    const ctxImp = canvasImpulse.getContext("2d");

    function resize() {
        canvasSFG.width = canvasSFG.parentElement.clientWidth * window.devicePixelRatio;
        canvasSFG.height = 220 * window.devicePixelRatio;
        ctxSFG.resetTransform();
        ctxSFG.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasImpulse.width = canvasImpulse.parentElement.clientWidth * window.devicePixelRatio;
        canvasImpulse.height = 220 * window.devicePixelRatio;
        ctxImp.resetTransform();
        ctxImp.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const b0 = parseFloat(sliders.b0.value);
        const b1 = parseFloat(sliders.b1.value);
        const b2 = parseFloat(sliders.b2.value);
        const a1 = parseFloat(sliders.a1.value);
        const a2 = parseFloat(sliders.a2.value);
        const form = selectForm.value;

        vals.b0.innerText = b0.toFixed(1);
        vals.b1.innerText = b1.toFixed(1);
        vals.b2.innerText = b2.toFixed(1);
        vals.a1.innerText = a1.toFixed(1);
        vals.a2.innerText = a2.toFixed(1);

        // 1. Calculate Impulse Response
        const numPoints = 40;
        const y = new Array(numPoints).fill(0);
        let isStable = true;

        // Compute step-by-step
        for (let n = 0; n < numPoints; n++) {
            const x_n = n === 0 ? 1.0 : 0.0;
            const x_n_1 = n === 1 ? 1.0 : 0.0;
            const x_n_2 = n === 2 ? 1.0 : 0.0;

            const y_n_1 = n >= 1 ? y[n - 1] : 0.0;
            const y_n_2 = n >= 2 ? y[n - 2] : 0.0;

            y[n] = b0 * x_n + b1 * x_n_1 + b2 * x_n_2 - a1 * y_n_1 - a2 * y_n_2;

            if (Math.abs(y[n]) > 1e4) {
                isStable = false;
                // Fill remaining with infinity approximations for plotting
                for (let k = n + 1; k < numPoints; k++) {
                    y[k] = Math.sign(y[n]) * 1e4;
                }
                break;
            }
        }

        // 2. Draw Statistics
        let registers = 2;
        if (form === "df1") registers = 4; // Separate input/output delays
        
        valStats.innerHTML = `
            Registers required: ${registers} (${form === "df1" ? "Non-Canonic" : "Canonic"})<br>
            Multipliers required: 5<br>
            System Stability: ${isStable ? "<span style='color: #10b981; font-weight: bold;'>STABLE</span>" : "<span style='color: #ef4444; font-weight: bold;'>UNSTABLE</span>"}
        `;

        // 3. Draw Impulse response
        drawImpulse(ctxImp, y, isStable);

        // 4. Draw SFG Diagram
        drawSFG(ctxSFG, form, b0, b1, b2, a1, a2);
    }

    function drawImpulse(ctx, vals, isStable) {
        const w = canvasImpulse.width / window.devicePixelRatio;
        const h = canvasImpulse.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        const padX = 25;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;
        const axisY = h / 2;

        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.beginPath();
        ctx.moveTo(padX, axisY);
        ctx.lineTo(w - padX, axisY);
        ctx.stroke();

        let maxVal = 1.0;
        vals.forEach(v => {
            if (Math.abs(v) > maxVal && Math.abs(v) < 1e5) maxVal = Math.abs(v);
        });

        vals.forEach((v, n) => {
            const px = padX + (n / (vals.length - 1)) * plotW;
            const py = axisY - (v / (maxVal * 1.1)) * (plotH / 2);

            ctx.strokeStyle = isStable ? "#3b82f6" : "#ef4444";
            ctx.fillStyle = isStable ? "#3b82f6" : "#ef4444";
            ctx.lineWidth = 1.5;

            // Stem
            ctx.beginPath();
            ctx.moveTo(px, axisY);
            ctx.lineTo(px, py);
            ctx.stroke();

            // Dot
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    function drawSFG(ctx, form, b0, b1, b2, a1, a2) {
        const w = canvasSFG.width / window.devicePixelRatio;
        const h = canvasSFG.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = "#e2e8f0";
        ctx.fillStyle = "white";
        ctx.lineWidth = 1.2;

        if (form === "df1") {
            // Direct Form I
            // Left feedforward path
            ctx.beginPath();
            ctx.moveTo(20, 60);
            ctx.lineTo(100, 60);
            ctx.stroke();
            drawDelayBox(ctx, 50, 80, "z^-1");
            drawDelayBox(ctx, 50, 140, "z^-1");
            ctx.beginPath();
            ctx.moveTo(50, 60);
            ctx.lineTo(50, 160);
            ctx.stroke();

            // Tap coefficients
            drawMultiplier(ctx, 80, 60, "b0", b0);
            drawMultiplier(ctx, 80, 100, "b1", b1);
            drawMultiplier(ctx, 80, 160, "b2", b2);

            // Left summing node
            drawAdder(ctx, 110, 60);

            // Middle connection
            ctx.beginPath();
            ctx.moveTo(120, 60);
            ctx.lineTo(160, 60);
            ctx.stroke();

            // Right feedback path
            ctx.beginPath();
            ctx.moveTo(160, 60);
            ctx.lineTo(240, 60);
            ctx.stroke();
            drawDelayBox(ctx, 210, 80, "z^-1");
            drawDelayBox(ctx, 210, 140, "z^-1");
            ctx.beginPath();
            ctx.moveTo(210, 60);
            ctx.lineTo(210, 160);
            ctx.stroke();

            // feedback multipliers
            drawMultiplier(ctx, 180, 100, "-a1", -a1);
            drawMultiplier(ctx, 180, 160, "-a2", -a2);

            // Summing node right
            drawAdder(ctx, 170, 60);

            // Arrow flow
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "8px sans-serif";
            ctx.fillText("x[n]", 15, 52);
            ctx.fillText("y[n]", 235, 52);

        } else if (form === "df2") {
            // Direct Form II
            // Left sum
            drawAdder(ctx, 60, 60);
            ctx.beginPath();
            ctx.moveTo(20, 60);
            ctx.lineTo(50, 60);
            ctx.stroke();

            // Middle delay line
            ctx.beginPath();
            ctx.moveTo(130, 60);
            ctx.lineTo(130, 160);
            ctx.stroke();
            drawDelayBox(ctx, 130, 80, "z^-1");
            drawDelayBox(ctx, 130, 140, "z^-1");

            // Right sum
            drawAdder(ctx, 200, 60);
            ctx.beginPath();
            ctx.moveTo(70, 60);
            ctx.lineTo(190, 60);
            ctx.moveTo(210, 60);
            ctx.lineTo(240, 60);
            ctx.stroke();

            // Multipliers
            drawMultiplier(ctx, 90, 100, "-a1", -a1);
            drawMultiplier(ctx, 90, 160, "-a2", -a2);

            drawMultiplier(ctx, 170, 60, "b0", b0);
            drawMultiplier(ctx, 170, 100, "b1", b1);
            drawMultiplier(ctx, 170, 160, "b2", b2);

            // Connect lines
            ctx.beginPath();
            ctx.moveTo(130, 60);
            ctx.lineTo(70, 60);
            ctx.stroke();

            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "8px sans-serif";
            ctx.fillText("x[n]", 15, 52);
            ctx.fillText("y[n]", 235, 52);

        } else if (form === "tdf2") {
            // Transposed Direct Form II
            ctx.beginPath();
            ctx.moveTo(20, 60);
            ctx.lineTo(240, 60);
            ctx.stroke();

            // Sum nodes inside delay line
            drawAdder(ctx, 90, 60);
            drawAdder(ctx, 170, 60);

            drawDelayBox(ctx, 130, 60, "z^-1");
            drawDelayBox(ctx, 210, 60, "z^-1");

            // Multipliers pointing up
            drawMultiplier(ctx, 50, 120, "b0", b0);
            drawMultiplier(ctx, 90, 120, "b1", b1);
            drawMultiplier(ctx, 130, 120, "b2", b2);
            drawMultiplier(ctx, 170, 120, "-a1", -a1);
            drawMultiplier(ctx, 210, 120, "-a2", -a2);

            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "8px sans-serif";
            ctx.fillText("x[n]", 15, 52);
            ctx.fillText("y[n]", 235, 52);
        }
    }

    function drawDelayBox(ctx, x, y, label) {
        ctx.fillStyle = "#1f2937";
        ctx.strokeStyle = "#0dd5c5";
        ctx.lineWidth = 1;
        ctx.fillRect(x - 15, y - 10, 30, 20);
        ctx.strokeRect(x - 15, y - 10, 30, 20);
        ctx.fillStyle = "white";
        ctx.font = "8px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x, y);
    }

    function drawMultiplier(ctx, x, y, label, val) {
        ctx.fillStyle = "#8b5cf6";
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x, y);
        
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "7px monospace";
        ctx.fillText(`(${val.toFixed(1)})`, x, y + 16);
    }

    function drawAdder(ctx, x, y) {
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("+", x, y);
    }

    // Attach listeners
    Object.values(sliders).forEach(slider => {
        slider.addEventListener("input", draw);
    });
    selectForm.addEventListener("change", draw);

    draw();
}

// ============================================================================
// 25. IIR Cascade Realization & Pairing Simulator (Lecture 18)
// ============================================================================
function initCascadeSimulator() {
    const selectPairing = document.getElementById("select-l18-pairing");
    const selectOrder = document.getElementById("select-l18-order");
    const valStats = document.getElementById("val-l18-stats");
    const canvas = document.getElementById("canvas-l18-response");

    if (!selectPairing || !canvas) return;

    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
        canvas.height = 230 * window.devicePixelRatio;
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    // Subsystem evaluation: H(e^jw) = (b0 + b1 e^-jw + b2 e^-2jw) / (1 + a1 e^-jw + a2 e^-2jw)
    function evalSOS(w, b, a) {
        const numReal = b[0] + b[1] * Math.cos(-w) + b[2] * Math.cos(-2 * w);
        const numImag = b[1] * Math.sin(-w) + b[2] * Math.sin(-2 * w);

        const denReal = 1 + a[0] * Math.cos(-w) + a[1] * Math.cos(-2 * w);
        const denImag = a[0] * Math.sin(-w) + a[1] * Math.sin(-2 * w);

        const numMag = Math.sqrt(numReal * numReal + numImag * numImag);
        const denMag = Math.sqrt(denReal * denReal + denImag * denImag);

        return denMag > 1e-9 ? numMag / denMag : 0;
    }

    function draw() {
        const pairing = selectPairing.value;
        const order = selectOrder.value;

        // Quadratic coefficients for our poles and zeros:
        // Pole 1 (p1,2 = 0.9 e^j pi/4): a = [-1.2728, 0.81] (High-Q)
        // Pole 2 (p3,4 = 0.5 e^j 3pi/4): a = [0.7071, 0.25] (Low-Q)
        const a_pole1 = [-1.2728, 0.81];
        const a_pole2 = [0.7071, 0.25];

        // Zero 1 (z1,2 = 0.95 e^j pi/4): b = [1.0, -1.3435, 0.9025] (Close to Pole 1)
        // Zero 2 (z3,4 = -1 double root): b = [1.0, 2.0, 1.0] (Distant)
        const b_zero1 = [1.0, -1.3435, 0.9025];
        const b_zero2 = [1.0, 2.0, 1.0];

        let sos1_b, sos1_a;
        let sos2_b, sos2_a;

        // Determine pairing
        if (pairing === "good") {
            // Pole 1 paired with Zero 1 (closest)
            sos1_b = b_zero1; sos1_a = a_pole1; // Section A
            sos2_b = b_zero2; sos2_a = a_pole2; // Section B
        } else {
            // Pole 1 paired with Zero 2 (distant)
            sos1_b = b_zero2; sos1_a = a_pole1; // Section C
            sos2_b = b_zero1; sos2_a = a_pole2; // Section D
        }

        // Determine ordering
        // In the cascade block diagram: Stage 1 feeds Stage 2.
        let stage1_b, stage1_a;
        let stage2_b, stage2_a;

        if (order === "good") {
            // Low-Q section first. Pole 2 is Low-Q (radius 0.5), Pole 1 is High-Q (radius 0.9)
            // So Section containing Pole 2 is Stage 1, Section containing Pole 1 is Stage 2
            if (pairing === "good") {
                stage1_b = sos2_b; stage1_a = sos2_a; // Section B (Pole 2 + Zero 2)
                stage2_b = sos1_b; stage2_a = sos1_a; // Section A (Pole 1 + Zero 1)
            } else {
                stage1_b = sos2_b; stage1_a = sos2_a; // Section D (Pole 2 + Zero 1)
                stage2_b = sos1_b; stage2_a = sos1_a; // Section C (Pole 1 + Zero 2)
            }
        } else {
            // High-Q section first (Pole 1 section is Stage 1)
            if (pairing === "good") {
                stage1_b = sos1_b; stage1_a = sos1_a; // Section A (Pole 1 + Zero 1)
                stage2_b = sos2_b; stage2_a = sos2_a; // Section B (Pole 2 + Zero 2)
            } else {
                stage1_b = sos1_b; stage1_a = sos1_a; // Section C (Pole 1 + Zero 2)
                stage2_b = sos2_b; stage2_a = sos2_a; // Section D (Pole 2 + Zero 1)
            }
        }

        // Calculate curves
        const numPoints = 120;
        const stage1_db = [];
        const stage2_db = [];
        const total_db = [];

        let maxStage1 = -100;
        let maxStage2 = -100;

        for (let i = 0; i < numPoints; i++) {
            const w = (i / (numPoints - 1)) * Math.PI;

            const h1 = evalSOS(w, stage1_b, stage1_a);
            const h2 = evalSOS(w, stage2_b, stage2_a);
            const h_total = h1 * h2;

            // Convert to dB with floor of -40 dB
            const db1 = Math.max(-40, 20 * Math.log10(h1));
            const db2 = Math.max(-40, 20 * Math.log10(h2));
            const db_total = Math.max(-40, 20 * Math.log10(h_total));

            stage1_db.push(db1);
            stage2_db.push(db2);
            total_db.push(db_total);

            if (db1 > maxStage1) maxStage1 = db1;
            if (db2 > maxStage2) maxStage2 = db2;
        }

        // Display stats
        const limitText = maxStage1 > 15 
            ? "<span style='color: #ef4444; font-weight: bold;'>Stage 1 overflow risk (High peak!)</span>"
            : "<span style='color: #10b981;'>Stage 1 levels safe (Low peak)</span>";

        valStats.innerHTML = `
            Stage 1 Peak: ${maxStage1.toFixed(1)} dB<br>
            Stage 2 Peak: ${maxStage2.toFixed(1)} dB<br>
            Status: ${limitText}
        `;

        // Draw response
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        const padX = 40;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Draw Grid
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        
        // Y-axis gridlines: 20dB to -40dB
        for (let i = 0; i <= 3; i++) {
            const y = padY + (i / 3) * plotH;
            ctx.beginPath();
            ctx.moveTo(padX, y);
            ctx.lineTo(w - padX, y);
            ctx.stroke();

            // Label
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "8px monospace";
            ctx.textAlign = "right";
            const val = 20 - i * 20;
            ctx.fillText(`${val} dB`, padX - 5, y + 3);
        }

        // X-axis gridlines
        for (let i = 0; i <= 4; i++) {
            const x = padX + (i / 4) * plotW;
            ctx.beginPath();
            ctx.moveTo(x, padY);
            ctx.lineTo(x, padY + plotH);
            ctx.stroke();

            // Label
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "8px monospace";
            ctx.textAlign = "center";
            const labels = ["0", "\u03c0/4", "\u03c0/2", "3\u03c0/4", "\u03c0"];
            ctx.fillText(labels[i], x, padY + plotH + 11);
        }

        // Draw curves
        // Stage 1: red dashed
        drawDBCurve(ctx, stage1_db, plotW, plotH, padX, padY, "#ef4444", 1.2, true);
        // Stage 2: green dashed
        drawDBCurve(ctx, stage2_db, plotW, plotH, padX, padY, "#10b981", 1.2, true);
        // Total Cascade: blue solid
        drawDBCurve(ctx, total_db, plotW, plotH, padX, padY, "#3b82f6", 2.2, false);

        // Titles
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Normalized Frequency (radians)", padX + plotW / 2, padY + plotH + 26);
    }

    function drawDBCurve(ctx, dbVals, plotW, plotH, padX, padY, color, width, dash = false) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        if (dash) {
            ctx.setLineDash([4, 3]);
        } else {
            ctx.setLineDash([]);
        }

        ctx.beginPath();
        for (let i = 0; i < dbVals.length; i++) {
            const px = padX + (i / (dbVals.length - 1)) * plotW;
            // Map 20 dB to top, -40 dB to bottom
            const val = dbVals[i];
            const clamped = Math.max(-40, Math.min(20, val));
            const norm = (clamped - (-40)) / 60; // 0 to 1
            const py = padY + plotH - norm * plotH;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset
    }

    selectPairing.addEventListener("change", draw);
    selectOrder.addEventListener("change", draw);

    draw();
}

// ============================================================================
// 26. IIR Parallel Realization & Summing Simulator (Lecture 19)
// ============================================================================
function initParallelSimulator() {
    const sliders = {
        a1: document.getElementById("slider-l19-a1"),
        p1: document.getElementById("slider-l19-p1"),
        a2: document.getElementById("slider-l19-a2"),
        p2: document.getElementById("slider-l19-p2")
    };

    const vals = {
        a1: document.getElementById("val-l19-a1"),
        p1: document.getElementById("val-l19-p1"),
        a2: document.getElementById("val-l19-a2"),
        p2: document.getElementById("val-l19-p2")
    };

    const valMath = document.getElementById("val-l19-math");
    const canvas = document.getElementById("canvas-l19-response");

    if (!sliders.a1 || !canvas) return;

    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
        canvas.height = 230 * window.devicePixelRatio;
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function evalSection(w, A, p) {
        // H(z) = A / (1 - p z^-1)
        // H(e^jw) = A / (1 - p cos(w) + j p sin(w))
        const denReal = 1 - p * Math.cos(w);
        const denImag = p * Math.sin(w);
        const denMag2 = denReal * denReal + denImag * denImag;

        return {
            r: denMag2 > 1e-9 ? (A * denReal) / denMag2 : 0,
            i: denMag2 > 1e-9 ? (-A * denImag) / denMag2 : 0
        };
    }

    function draw() {
        const A1 = parseFloat(sliders.a1.value);
        const p1 = parseFloat(sliders.p1.value);
        const A2 = parseFloat(sliders.a2.value);
        const p2 = parseFloat(sliders.p2.value);

        vals.a1.innerText = A1.toFixed(1);
        vals.p1.innerText = p1.toFixed(2);
        vals.a2.innerText = A2.toFixed(1);
        vals.p2.innerText = p2.toFixed(2);

        // Calculate implicit transfer function
        // H(z) = ( (A1 + A2) - (A1*p2 + A2*p1) z^-1 ) / ( 1 - (p1 + p2)z^-1 + p1*p2 z^-2 )
        const b0 = A1 + A2;
        const b1 = -(A1 * p2 + A2 * p1);
        const a1_coeff = -(p1 + p2);
        const a2_coeff = p1 * p2;

        let mathText = "";
        if (Math.abs(b0) > 1e-3) {
            const zeroVal = -b1 / b0;
            mathText = `H(z) = (${b0.toFixed(2)} ${b1 >= 0 ? '+' : '-'} ${Math.abs(b1).toFixed(2)} z^-1) / (1 ${a1_coeff >= 0 ? '+' : '-'} ${Math.abs(a1_coeff).toFixed(2)} z^-1 ${a2_coeff >= 0 ? '+' : '-'} ${Math.abs(a2_coeff).toFixed(2)} z^-2)<br>Implicit Zero location: z = ${zeroVal.toFixed(2)}`;
        } else {
            mathText = `H(z) = (${b1.toFixed(2)} z^-1) / (1 ${a1_coeff >= 0 ? '+' : '-'} ${Math.abs(a1_coeff).toFixed(2)} z^-1 ${a2_coeff >= 0 ? '+' : '-'} ${Math.abs(a2_coeff).toFixed(2)} z^-2)<br>Implicit Zero: None (strictly bandpass/highpass shape)`;
        }
        valMath.innerHTML = mathText;

        // Calculate curves
        const numPoints = 120;
        const sec1_mag = [];
        const sec2_mag = [];
        const total_mag = [];

        for (let i = 0; i < numPoints; i++) {
            const w = (i / (numPoints - 1)) * Math.PI;

            const h1 = evalSection(w, A1, p1);
            const h2 = evalSection(w, A2, p2);

            const h1_mag = Math.sqrt(h1.r * h1.r + h1.i * h1.i);
            const h2_mag = Math.sqrt(h2.r * h2.r + h2.i * h2.i);

            const total_r = h1.r + h2.r;
            const total_i = h1.i + h2.i;
            const total_m = Math.sqrt(total_r * total_r + total_i * total_i);

            sec1_mag.push(h1_mag);
            sec2_mag.push(h2_mag);
            total_mag.push(total_m);
        }

        // Draw
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        const padX = 35;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Draw grid
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        
        // Amplitude gridlines (0 to 6.0)
        for (let i = 0; i <= 3; i++) {
            const y = padY + (i / 3) * plotH;
            ctx.beginPath();
            ctx.moveTo(padX, y);
            ctx.lineTo(w - padX, y);
            ctx.stroke();

            // Label
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "8px monospace";
            ctx.textAlign = "right";
            const valLabel = (6.0 * (1 - i / 3)).toFixed(1);
            ctx.fillText(valLabel, padX - 5, y + 3);
        }

        // Frequency gridlines
        for (let i = 0; i <= 4; i++) {
            const x = padX + (i / 4) * plotW;
            ctx.beginPath();
            ctx.moveTo(x, padY);
            ctx.lineTo(x, padY + plotH);
            ctx.stroke();

            // Label
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "8px monospace";
            ctx.textAlign = "center";
            const labels = ["0", "\u03c0/4", "\u03c0/2", "3\u03c0/4", "\u03c0"];
            ctx.fillText(labels[i], x, padY + plotH + 11);
        }

        // Draw curves
        // Section 1: red dashed
        drawCurve(ctx, sec1_mag, plotW, plotH, padX, padY, "#ef4444", 1.2, true);
        // Section 2: green dashed
        drawCurve(ctx, sec2_mag, plotW, plotH, padX, padY, "#10b981", 1.2, true);
        // Total sum: blue solid
        drawCurve(ctx, total_mag, plotW, plotH, padX, padY, "#3b82f6", 2.2, false);

        // Titles
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Normalized Frequency (radians)", padX + plotW / 2, padY + plotH + 26);
    }

    function drawCurve(ctx, magVals, plotW, plotH, padX, padY, color, width, dash = false) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        if (dash) {
            ctx.setLineDash([4, 3]);
        } else {
            ctx.setLineDash([]);
        }

        ctx.beginPath();
        for (let i = 0; i < magVals.length; i++) {
            const px = padX + (i / (magVals.length - 1)) * plotW;
            const val = magVals[i];
            const clamped = Math.min(6.0, val);
            const py = padY + plotH - (clamped / 6.0) * plotH;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset
    }

    // Attach listeners
    Object.values(sliders).forEach(slider => {
        slider.addEventListener("input", draw);
    });

    draw();
}

// ============================================================================
// 27. Lattice & Minimum-Phase Simulator (Lecture 20)
// ============================================================================
function initLatticeSimulator() {
    const sliders = {
        k1: document.getElementById("slider-l20-k1"),
        k2: document.getElementById("slider-l20-k2")
    };

    const vals = {
        k1: document.getElementById("val-l20-k1"),
        k2: document.getElementById("val-l20-k2"),
        status: document.getElementById("val-l20-status")
    };

    const canvasSFG = document.getElementById("canvas-l20-sfg");
    const canvasZ = document.getElementById("canvas-l20-zplane");

    if (!sliders.k1 || !canvasSFG || !canvasZ) return;

    const ctxSFG = canvasSFG.getContext("2d");
    const ctxZ = canvasZ.getContext("2d");

    function resize() {
        canvasSFG.width = canvasSFG.parentElement.clientWidth * window.devicePixelRatio;
        canvasSFG.height = 210 * window.devicePixelRatio;
        ctxSFG.resetTransform();
        ctxSFG.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasZ.width = canvasZ.parentElement.clientWidth * window.devicePixelRatio;
        canvasZ.height = 210 * window.devicePixelRatio;
        ctxZ.resetTransform();
        ctxZ.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const K1 = parseFloat(sliders.k1.value);
        const K2 = parseFloat(sliders.k2.value);

        vals.k1.innerText = K1.toFixed(1);
        vals.k2.innerText = K2.toFixed(1);

        // Convert lattice to direct-form coefficients:
        // h[0] = 1.0
        // h[1] = K1*(1 + K2)
        // h[2] = K2
        const h1 = K1 * (1 + K2);
        const h2 = K2;

        // Calculate roots of z^2 + h1*z + h2 = 0
        const D = h1 * h1 - 4 * h2;
        let z1 = { r: 0, i: 0 };
        let z2 = { r: 0, i: 0 };
        let rootsText = "";

        if (D >= 0) {
            z1.r = (-h1 + Math.sqrt(D)) / 2;
            z2.r = (-h1 - Math.sqrt(D)) / 2;
            rootsText = `z1 = ${z1.r.toFixed(2)}, z2 = ${z2.r.toFixed(2)} (Mag: ${Math.abs(z1.r).toFixed(2)}, ${Math.abs(z2.r).toFixed(2)})`;
        } else {
            z1.r = -h1 / 2;
            z1.i = Math.sqrt(-D) / 2;
            z2.r = -h1 / 2;
            z2.i = -Math.sqrt(-D) / 2;
            const mag = Math.sqrt(z1.r * z1.r + z1.i * z1.i);
            rootsText = `z = ${z1.r.toFixed(2)} \u00b1 j${z1.i.toFixed(2)} (Mag: ${mag.toFixed(2)})`;
        }

        const isMinPhase = Math.abs(K1) < 1.0 && Math.abs(K2) < 1.0;

        vals.status.innerHTML = `
            Direct form: h = [1.0, ${h1.toFixed(2)}, ${h2.toFixed(2)}]<br>
            Zeros: ${rootsText}<br>
            Property: ${isMinPhase ? "<span style='color: #10b981; font-weight: bold;'>MINIMUM-PHASE</span>" : "<span style='color: #ef4444; font-weight: bold;'>NON-MINIMUM PHASE</span>"}
        `;

        // 1. Draw SFG
        drawLatticeSFG(ctxSFG, K1, K2);

        // 2. Draw Pole-Zero
        drawLatticeZPlane(ctxZ, z1, z2, isMinPhase);
    }

    function drawLatticeSFG(ctx, K1, K2) {
        const w = canvasSFG.width / window.devicePixelRatio;
        const h = canvasSFG.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = "#e2e8f0";
        ctx.fillStyle = "white";
        ctx.lineWidth = 1.2;

        // Stage horizontal lines
        ctx.beginPath();
        // Top forward path
        ctx.moveTo(15, 50); ctx.lineTo(240, 50);
        // Bottom backward path
        ctx.moveTo(15, 140); ctx.lineTo(240, 140);
        ctx.stroke();

        // Stage 1 cross lines
        ctx.beginPath();
        ctx.moveTo(40, 50); ctx.lineTo(120, 140);
        ctx.moveTo(80, 140); ctx.lineTo(120, 50);
        ctx.stroke();

        // Stage 2 cross lines
        ctx.beginPath();
        ctx.moveTo(130, 50); ctx.lineTo(210, 140);
        ctx.moveTo(170, 140); ctx.lineTo(210, 50);
        ctx.stroke();

        // Delay elements on bottom path
        drawDelayBox(ctx, 60, 140, "z^-1");
        drawDelayBox(ctx, 150, 140, "z^-1");

        // Multipliers
        drawMultiplier(ctx, 80, 95, "K1", K1);
        drawMultiplier(ctx, 170, 95, "K2", K2);

        // Sum Nodes
        drawAdder(ctx, 120, 50);
        drawAdder(ctx, 120, 140);
        drawAdder(ctx, 210, 50);
        drawAdder(ctx, 210, 140);

        // Labels
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "8px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("x[n]", 15, 42);
        ctx.fillText("y[n]", 242, 50);
    }

    function drawLatticeZPlane(ctx, z1, z2, isMinPhase) {
        const w = canvasZ.width / window.devicePixelRatio;
        const h = canvasZ.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(cx, cy) - 20;

        // Draw axes
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - radius - 10, cy);
        ctx.lineTo(cx + radius + 10, cy);
        ctx.moveTo(cx, cy - radius - 10);
        ctx.lineTo(cx, cy + radius + 10);
        ctx.stroke();

        // Draw Unit Circle
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.stroke();

        // Zeros color
        ctx.fillStyle = isMinPhase ? "#10b981" : "#ef4444";
        ctx.strokeStyle = isMinPhase ? "#10b981" : "#ef4444";
        ctx.lineWidth = 2;

        // Plot zero 1
        const x1 = cx + z1.r * radius;
        const y1 = cy - z1.i * radius;
        ctx.beginPath();
        ctx.arc(x1, y1, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Plot zero 2
        const x2 = cx + z2.r * radius;
        const y2 = cy - z2.i * radius;
        ctx.beginPath();
        ctx.arc(x2, y2, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    function drawDelayBox(ctx, x, y, label) {
        ctx.fillStyle = "#1f2937";
        ctx.strokeStyle = "#0dd5c5";
        ctx.lineWidth = 1;
        ctx.fillRect(x - 12, y - 10, 24, 20);
        ctx.strokeRect(x - 12, y - 10, 24, 20);
        ctx.fillStyle = "white";
        ctx.font = "8px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x, y);
    }

    function drawMultiplier(ctx, x, y, label, val) {
        ctx.fillStyle = "#8b5cf6";
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x, y);
        
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "7px monospace";
        ctx.fillText(`(${val.toFixed(1)})`, x, y + 15);
    }

    function drawAdder(ctx, x, y) {
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("+", x, y);
    }

    // Attach listeners
    Object.values(sliders).forEach(slider => {
        slider.addEventListener("input", draw);
    });

    draw();
}

// ============================================================================
// 28. FIR Specifications & Zeros Quadruplet Simulator (Lecture 21)
// ============================================================================
function initFIRSpecificationsSimulator() {
    const sliderR = document.getElementById("slider-l21-r");
    const sliderTheta = document.getElementById("slider-l21-theta");
    const valR = document.getElementById("val-l21-r");
    const valTheta = document.getElementById("val-l21-theta");
    const valZeros = document.getElementById("val-l21-zeros");
    const canvasZ = document.getElementById("canvas-l21-zplane");

    const selectType = document.getElementById("select-l21-firtype");
    const valConstraints = document.getElementById("val-l21-constraints");
    const canvasResp = document.getElementById("canvas-l21-response");

    if (!sliderR || !canvasZ || !canvasResp) return;

    const ctxZ = canvasZ.getContext("2d");
    const ctxResp = canvasResp.getContext("2d");

    function resize() {
        canvasZ.width = canvasZ.parentElement.clientWidth * window.devicePixelRatio;
        canvasZ.height = 230 * window.devicePixelRatio;
        ctxZ.resetTransform();
        ctxZ.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasResp.width = canvasResp.parentElement.clientWidth * window.devicePixelRatio;
        canvasResp.height = 230 * window.devicePixelRatio;
        ctxResp.resetTransform();
        ctxResp.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        // --- Part 1: Zeros Quadruplet ---
        const r = parseFloat(sliderR.value);
        const thetaDeg = parseFloat(sliderTheta.value);
        const theta = (thetaDeg * Math.PI) / 180;

        valR.innerText = r.toFixed(2);
        valTheta.innerText = `${thetaDeg}°`;

        // quadruplet coordinates
        const z0_r = r * Math.cos(theta);
        const z0_i = r * Math.sin(theta);

        const z1_r = r * Math.cos(-theta);
        const z1_i = r * Math.sin(-theta);

        // reciprocal: 1/z0 = 1/r * e^(-j theta)
        const rec_r = 1 / r;
        const z2_r = rec_r * Math.cos(-theta);
        const z2_i = rec_r * Math.sin(-theta);

        const z3_r = rec_r * Math.cos(theta);
        const z3_i = rec_r * Math.sin(theta);

        valZeros.innerHTML = `
            z0   =  ${z0_r.toFixed(2)} + j${z0_i.toFixed(2)}<br>
            z0*  =  ${z1_r.toFixed(2)} - j${Math.abs(z1_i).toFixed(2)}<br>
            1/z0 =  ${z2_r.toFixed(2)} - j${Math.abs(z2_i).toFixed(2)}<br>
            1/z0*=  ${z3_r.toFixed(2)} + j${z3_i.toFixed(2)}
        `;

        drawZPlaneQuad(z0_r, z0_i, z1_r, z1_i, z2_r, z2_i, z3_r, z3_i, r, rec_r);

        // --- Part 2: Type Constraints ---
        const type = selectType.value;
        drawTypeEnvelope(type);
    }

    function drawZPlaneQuad(z0_r, z0_i, z1_r, z1_i, z2_r, z2_i, z3_r, z3_i, r, rec_r) {
        const w = canvasZ.width / window.devicePixelRatio;
        const h = canvasZ.height / window.devicePixelRatio;
        ctxZ.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        // scale: 1.0 (unit circle) is at 60 pixels
        const scale = 55;

        // Axes
        ctxZ.strokeStyle = "rgba(255,255,255,0.08)";
        ctxZ.lineWidth = 1;
        ctxZ.beginPath();
        ctxZ.moveTo(10, cy); ctxZ.lineTo(w - 10, cy);
        ctxZ.moveTo(cx, 10); ctxZ.lineTo(cx, h - 10);
        ctxZ.stroke();

        // Unit Circle
        ctxZ.strokeStyle = "rgba(255,255,255,0.2)";
        ctxZ.beginPath();
        ctxZ.arc(cx, cy, scale, 0, 2 * Math.PI);
        ctxZ.stroke();

        // Connect zeros to show symmetry shape
        ctxZ.strokeStyle = "rgba(139, 92, 246, 0.25)";
        ctxZ.lineWidth = 1;
        ctxZ.setLineDash([3, 2]);
        ctxZ.beginPath();
        // Draw rectangle
        ctxZ.moveTo(cx + z0_r * scale, cy - z0_i * scale);
        ctxZ.lineTo(cx + z3_r * scale, cy - z3_i * scale);
        ctxZ.lineTo(cx + z2_r * scale, cy - z2_i * scale);
        ctxZ.lineTo(cx + z1_r * scale, cy - z1_i * scale);
        ctxZ.closePath();
        ctxZ.stroke();
        ctxZ.setLineDash([]);

        // Radial lines
        ctxZ.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctxZ.beginPath();
        ctxZ.moveTo(cx, cy); ctxZ.lineTo(cx + z3_r * scale, cy - z3_i * scale);
        ctxZ.moveTo(cx, cy); ctxZ.lineTo(cx + z2_r * scale, cy - z2_i * scale);
        ctxZ.stroke();

        // Plot Zeros
        const zeros = [
            { r: z0_r, i: z0_i, color: "#8b5cf6", name: "z0" },
            { r: z1_r, i: z1_i, color: "#a78bfa", name: "z0*" },
            { r: z2_r, i: z2_i, color: "#10b981", name: "1/z0" },
            { r: z3_r, i: z3_i, color: "#34d399", name: "1/z0*" }
        ];

        zeros.forEach(z => {
            const px = cx + z.r * scale;
            const py = cy - z.i * scale;
            ctxZ.fillStyle = z.color;
            ctxZ.beginPath();
            ctxZ.arc(px, py, 4, 0, 2 * Math.PI);
            ctxZ.fill();

            // Label name
            ctxZ.fillStyle = "rgba(255,255,255,0.7)";
            ctxZ.font = "8px sans-serif";
            ctxZ.fillText(z.name, px + 6, py + 3);
        });
    }

    function drawTypeEnvelope(type) {
        let symmetryText = "";
        let tapsText = "";
        let lockedText = "";
        let suitableText = "";

        if (type === "I") {
            symmetryText = "Symmetric";
            tapsText = "Odd (e.g. M = 15)";
            lockedText = "None";
            suitableText = "LPF, HPF, BPF, BSF (All filters)";
        } else if (type === "II") {
            symmetryText = "Symmetric";
            tapsText = "Even (e.g. M = 16)";
            lockedText = "Forced zero at \u03c0 (Nyquist)";
            suitableText = "LPF, BPF only (No HPF/BSF)";
        } else if (type === "III") {
            symmetryText = "Antisymmetric";
            tapsText = "Odd (e.g. M = 15)";
            lockedText = "Forced zeros at 0 (DC) and \u03c0 (Nyquist)";
            suitableText = "BPF only, Differentiators, Hilbert Transformers";
        } else {
            symmetryText = "Antisymmetric";
            tapsText = "Even (e.g. M = 16)";
            lockedText = "Forced zero at 0 (DC)";
            suitableText = "HPF, BPF only (No LPF/BSF)";
        }

        valConstraints.innerHTML = `
            Symmetry: ${symmetryText}<br>
            Taps M: ${tapsText}<br>
            Locked-out: <span style="color: #ef4444;">${lockedText}</span><br>
            Suitable for: <span style="color: #10b981; font-weight: bold;">${suitableText}</span>
        `;

        // Draw magnitude response shape
        const w = canvasResp.width / window.devicePixelRatio;
        const h = canvasResp.height / window.devicePixelRatio;
        ctxResp.clearRect(0, 0, w, h);

        const padX = 40;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Grid
        ctxResp.strokeStyle = "rgba(255,255,255,0.06)";
        ctxResp.lineWidth = 1;
        ctxResp.beginPath();
        // Horizontals
        ctxResp.moveTo(padX, padY); ctxResp.lineTo(w - padX, padY);
        ctxResp.moveTo(padX, padY + plotH); ctxResp.lineTo(w - padX, padY + plotH);
        // Verticals
        ctxResp.moveTo(padX, padY); ctxResp.lineTo(padX, padY + plotH);
        ctxResp.moveTo(padX + plotW, padY); ctxResp.lineTo(padX + plotW, padY + plotH);
        ctxResp.stroke();

        // Labels
        ctxResp.fillStyle = "rgba(255,255,255,0.4)";
        ctxResp.font = "8px monospace";
        ctxResp.textAlign = "center";
        ctxResp.fillText("0 (DC)", padX, padY + plotH + 11);
        ctxResp.fillText("\u03c0 (Nyquist)", padX + plotW, padY + plotH + 11);

        ctxResp.textAlign = "right";
        ctxResp.fillText("1.0", padX - 5, padY + 3);
        ctxResp.fillText("0.0", padX - 5, padY + plotH + 3);

        // Calculate and draw representative curve
        ctxResp.beginPath();
        ctxResp.strokeStyle = "#3b82f6";
        ctxResp.lineWidth = 2.0;

        const numPoints = 80;
        for (let i = 0; i < numPoints; i++) {
            const freq = (i / (numPoints - 1)) * Math.PI;
            let val = 0;

            if (type === "I") {
                // Typical LPF that doesn't hit 0 at ends
                val = 0.8 * Math.cos(freq / 2.2);
            } else if (type === "II") {
                // Must hit 0 at pi
                val = 0.85 * Math.cos(freq / 2);
            } else if (type === "III") {
                // Must hit 0 at 0 and pi (Bandpass)
                val = 0.8 * Math.sin(freq);
            } else {
                // Must hit 0 at 0 (Highpass)
                val = 0.85 * Math.sin(freq / 2);
            }

            const px = padX + (i / (numPoints - 1)) * plotW;
            const py = padY + plotH - val * plotH;

            if (i === 0) {
                ctxResp.moveTo(px, py);
            } else {
                ctxResp.lineTo(px, py);
            }
        }
        ctxResp.stroke();

        // Mark locked zeros with red circles
        ctxResp.fillStyle = "#ef4444";
        if (type === "II") {
            ctxResp.beginPath();
            ctxResp.arc(padX + plotW, padY + plotH, 4, 0, 2 * Math.PI);
            ctxResp.fill();
            ctxResp.fillText("Zero", padX + plotW - 10, padY + plotH - 8);
        } else if (type === "III") {
            ctxResp.beginPath();
            ctxResp.arc(padX, padY + plotH, 4, 0, 2 * Math.PI);
            ctxResp.arc(padX + plotW, padY + plotH, 4, 0, 2 * Math.PI);
            ctxResp.fill();
            ctxResp.fillText("Zero", padX + 15, padY + plotH - 8);
            ctxResp.fillText("Zero", padX + plotW - 10, padY + plotH - 8);
        } else if (type === "IV") {
            ctxResp.beginPath();
            ctxResp.arc(padX, padY + plotH, 4, 0, 2 * Math.PI);
            ctxResp.fill();
            ctxResp.fillText("Zero", padX + 15, padY + plotH - 8);
        }
    }

    sliderR.addEventListener("input", draw);
    sliderTheta.addEventListener("input", draw);
    selectType.addEventListener("change", draw);

    draw();
}

// ============================================================================
// 29. FIR Window Design Simulator (Lecture 22)
// ============================================================================
function initWindowingSimulator() {
    const selectWin = document.getElementById("select-l22-window");
    const sliderWc = document.getElementById("slider-l22-wc");
    const sliderM = document.getElementById("slider-l22-m");

    const valWc = document.getElementById("val-l22-wc");
    const valM = document.getElementById("val-l22-m");
    const valMetrics = document.getElementById("val-l22-metrics");

    const canvasImp = document.getElementById("canvas-l22-impulse");
    const canvasResp = document.getElementById("canvas-l22-response");

    if (!selectWin || !canvasImp || !canvasResp) return;

    const ctxImp = canvasImp.getContext("2d");
    const ctxResp = canvasResp.getContext("2d");

    function resize() {
        canvasImp.width = canvasImp.parentElement.clientWidth * window.devicePixelRatio;
        canvasImp.height = 230 * window.devicePixelRatio;
        ctxImp.resetTransform();
        ctxImp.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasResp.width = canvasResp.parentElement.clientWidth * window.devicePixelRatio;
        canvasResp.height = 230 * window.devicePixelRatio;
        ctxResp.resetTransform();
        ctxResp.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const win = selectWin.value;
        const wcVal = parseFloat(sliderWc.value); // as fraction of pi
        const wc = wcVal * Math.PI; // in radians
        const M = parseInt(sliderM.value);
        const alpha = (M - 1) / 2;

        valWc.innerText = wcVal.toFixed(2);
        valM.innerText = M;

        // Calculate coefficients h[n]
        const h_coeffs = [];
        for (let n = 0; n < M; n++) {
            let hd = 0;
            const diff = n - alpha;
            if (Math.abs(diff) < 1e-6) {
                hd = wc / Math.PI;
            } else {
                hd = Math.sin(wc * diff) / (Math.PI * diff);
            }

            let w = 1.0;
            if (win === "hann") {
                w = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (M - 1));
            }

            h_coeffs.push(hd * w);
        }

        // Draw time domain stem plot
        drawImpulseStem(h_coeffs, M);

        // Draw frequency response in dB
        drawFrequencyResponse(h_coeffs, M, wcVal, win);
    }

    function drawImpulseStem(coeffs, M) {
        const w = canvasImp.width / window.devicePixelRatio;
        const h = canvasImp.height / window.devicePixelRatio;
        ctxImp.clearRect(0, 0, w, h);

        const padX = 30;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Zero line
        const zeroY = padY + plotH * 0.8; // 80% down
        ctxImp.strokeStyle = "rgba(255,255,255,0.12)";
        ctxImp.lineWidth = 1;
        ctxImp.beginPath();
        ctxImp.moveTo(padX, zeroY);
        ctxImp.lineTo(w - padX, zeroY);
        ctxImp.stroke();

        // Draw stem lines
        ctxImp.lineWidth = 1.5;
        for (let n = 0; n < M; n++) {
            const x = padX + (n / (M - 1)) * plotW;
            const val = coeffs[n];
            // scale: val = 1.0 goes up to padY
            const py = zeroY - val * (plotH * 0.7);

            ctxImp.strokeStyle = "#3b82f6";
            ctxImp.beginPath();
            ctxImp.moveTo(x, zeroY);
            ctxImp.lineTo(x, py);
            ctxImp.stroke();

            // circle
            ctxImp.fillStyle = "#0dd5c5";
            ctxImp.beginPath();
            ctxImp.arc(x, py, 3, 0, 2 * Math.PI);
            ctxImp.fill();
        }

        // Labels
        ctxImp.fillStyle = "rgba(255,255,255,0.4)";
        ctxImp.font = "8px monospace";
        ctxImp.textAlign = "center";
        ctxImp.fillText("0", padX, zeroY + 11);
        ctxImp.fillText(`${M-1}`, padX + plotW, zeroY + 11);
        ctxImp.fillText("n", padX + plotW/2, zeroY + 22);
    }

    function drawFrequencyResponse(coeffs, M, wcVal, win) {
        const w = canvasResp.width / window.devicePixelRatio;
        const h = canvasResp.height / window.devicePixelRatio;
        ctxResp.clearRect(0, 0, w, h);

        const padX = 40;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Grid in dB: +10 dB to -60 dB
        ctxResp.strokeStyle = "rgba(255,255,255,0.06)";
        ctxResp.lineWidth = 1;
        
        for (let i = 0; i <= 7; i++) {
            const y = padY + (i / 7) * plotH;
            ctxResp.beginPath();
            ctxResp.moveTo(padX, y);
            ctxResp.lineTo(w - padX, y);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "8px monospace";
            ctxResp.textAlign = "right";
            const val = 10 - i * 10;
            ctxResp.fillText(`${val} dB`, padX - 5, y + 3);
        }

        // Verticals
        for (let i = 0; i <= 4; i++) {
            const x = padX + (i / 4) * plotW;
            ctxResp.beginPath();
            ctxResp.moveTo(x, padY);
            ctxResp.lineTo(x, padY + plotH);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "8px monospace";
            ctxResp.textAlign = "center";
            const labels = ["0", "\u03c0/4", "\u03c0/2", "3\u03c0/4", "\u03c0"];
            ctxResp.fillText(labels[i], x, padY + plotH + 11);
        }

        // Draw Ideal Brickwall (Yellow dashed)
        ctxResp.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctxResp.lineWidth = 1.2;
        ctxResp.setLineDash([4, 4]);
        ctxResp.beginPath();
        const idealX = padX + wcVal * plotW;
        ctxResp.moveTo(idealX, padY);
        ctxResp.lineTo(idealX, padY + plotH);
        ctxResp.stroke();
        ctxResp.setLineDash([]);

        // Draw Limit markers
        ctxResp.strokeStyle = win === "rectangular" ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)";
        ctxResp.lineWidth = 1;
        ctxResp.setLineDash([2, 3]);
        // rectangular limit is at -21dB
        const limitDB = win === "rectangular" ? -21 : -44;
        const normLimit = (limitDB - 10) / -70; // 0 to 1
        const limitY = padY + normLimit * plotH;
        ctxResp.beginPath();
        ctxResp.moveTo(padX, limitY);
        ctxResp.lineTo(w - padX, limitY);
        ctxResp.stroke();
        ctxResp.setLineDash([]);
        ctxResp.fillStyle = win === "rectangular" ? "rgba(239, 68, 68, 0.5)" : "rgba(16, 185, 129, 0.5)";
        ctxResp.font = "7px sans-serif";
        ctxResp.textAlign = "left";
        ctxResp.fillText(`Sidelobe Limit (${limitDB} dB)`, padX + 5, limitY - 4);

        // Calculate actual response points
        const numPoints = 120;
        const resp_db = [];

        for (let i = 0; i < numPoints; i++) {
            const freq = (i / (numPoints - 1)) * Math.PI;
            let real = 0;
            let imag = 0;
            for (let n = 0; n < M; n++) {
                real += coeffs[n] * Math.cos(-freq * n);
                imag += coeffs[n] * Math.sin(-freq * n);
            }
            const mag = Math.sqrt(real * real + imag * imag);
            const dbVal = 20 * Math.log10(Math.max(1e-4, mag));
            resp_db.push(dbVal);
        }

        // Plot curve
        ctxResp.strokeStyle = win === "rectangular" ? "#ef4444" : "#10b981";
        ctxResp.lineWidth = 1.8;
        ctxResp.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const px = padX + (i / (numPoints - 1)) * plotW;
            const dbVal = resp_db[i];
            const clamped = Math.max(-60, Math.min(10, dbVal));
            const norm = (clamped - 10) / -70; // 0 to 1
            const py = padY + norm * plotH;

            if (i === 0) {
                ctxResp.moveTo(px, py);
            } else {
                ctxResp.lineTo(px, py);
            }
        }
        ctxResp.stroke();

        // Update dashboard metrics
        const mainLobe = win === "rectangular" ? (4 / M) : (8 / M);
        const stopbandAtten = win === "rectangular" ? "-21 dB" : "-44 dB";
        const pbRipple = win === "rectangular" ? "~0.74 dB" : "~0.05 dB";

        valMetrics.innerHTML = `
            Main Lobe Width: ${mainLobe.toFixed(3)}\u03c0 rad<br>
            Passband Ripple: ${pbRipple}<br>
            Stopband Attenuation: ${stopbandAtten}
        `;
    }

    selectWin.addEventListener("change", draw);
    sliderWc.addEventListener("input", draw);
    sliderM.addEventListener("input", draw);

    draw();
}

// ============================================================================
// 30. FIR Windowing Comparison Simulator (Lecture 23)
// ============================================================================
function initWindowingComparisonSimulator() {
    const selectWin = document.getElementById("select-l23-window");
    const sliderWc = document.getElementById("slider-l23-wc");
    const sliderM = document.getElementById("slider-l23-m");

    const valWc = document.getElementById("val-l23-wc");
    const valM = document.getElementById("val-l23-m");
    const valMetrics = document.getElementById("val-l23-metrics");

    const canvasImp = document.getElementById("canvas-l23-impulse");
    const canvasResp = document.getElementById("canvas-l23-response");

    if (!selectWin || !canvasImp || !canvasResp) return;

    const ctxImp = canvasImp.getContext("2d");
    const ctxResp = canvasResp.getContext("2d");

    function resize() {
        canvasImp.width = canvasImp.parentElement.clientWidth * window.devicePixelRatio;
        canvasImp.height = 230 * window.devicePixelRatio;
        ctxImp.resetTransform();
        ctxImp.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasResp.width = canvasResp.parentElement.clientWidth * window.devicePixelRatio;
        canvasResp.height = 230 * window.devicePixelRatio;
        ctxResp.resetTransform();
        ctxResp.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const win = selectWin.value;
        const wcVal = parseFloat(sliderWc.value); // as fraction of pi
        const wc = wcVal * Math.PI; // in radians
        const M = parseInt(sliderM.value);
        const alpha = (M - 1) / 2;

        valWc.innerText = wcVal.toFixed(2);
        valM.innerText = M;

        // Calculate coefficients h[n]
        const h_coeffs = [];
        for (let n = 0; n < M; n++) {
            let hd = 0;
            const diff = n - alpha;
            if (Math.abs(diff) < 1e-6) {
                hd = wc / Math.PI;
            } else {
                hd = Math.sin(wc * diff) / (Math.PI * diff);
            }

            let w = 1.0;
            if (win === "hann") {
                w = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (M - 1));
            } else if (win === "hamming") {
                w = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (M - 1));
            } else if (win === "blackman") {
                w = 0.42 - 0.5 * Math.cos((2 * Math.PI * n) / (M - 1)) + 0.08 * Math.cos((4 * Math.PI * n) / (M - 1));
            }

            h_coeffs.push(hd * w);
        }

        // Draw time domain stem plot
        drawImpulseStem(h_coeffs, M);

        // Draw frequency response in dB (using -90dB bottom to show Blackman details!)
        drawFrequencyResponse(h_coeffs, M, wcVal, win);
    }

    function drawImpulseStem(coeffs, M) {
        const w = canvasImp.width / window.devicePixelRatio;
        const h = canvasImp.height / window.devicePixelRatio;
        ctxImp.clearRect(0, 0, w, h);

        const padX = 30;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Zero line
        const zeroY = padY + plotH * 0.8; // 80% down
        ctxImp.strokeStyle = "rgba(255,255,255,0.12)";
        ctxImp.lineWidth = 1;
        ctxImp.beginPath();
        ctxImp.moveTo(padX, zeroY);
        ctxImp.lineTo(w - padX, zeroY);
        ctxImp.stroke();

        // Draw stem lines
        ctxImp.lineWidth = 1.5;
        for (let n = 0; n < M; n++) {
            const x = padX + (n / (M - 1)) * plotW;
            const val = coeffs[n];
            const py = zeroY - val * (plotH * 0.7);

            ctxImp.strokeStyle = "#a78bfa";
            ctxImp.beginPath();
            ctxImp.moveTo(x, zeroY);
            ctxImp.lineTo(x, py);
            ctxImp.stroke();

            // circle
            ctxImp.fillStyle = "#fb7185";
            ctxImp.beginPath();
            ctxImp.arc(x, py, 3, 0, 2 * Math.PI);
            ctxImp.fill();
        }

        // Labels
        ctxImp.fillStyle = "rgba(255,255,255,0.4)";
        ctxImp.font = "8px monospace";
        ctxImp.textAlign = "center";
        ctxImp.fillText("0", padX, zeroY + 11);
        ctxImp.fillText(`${M-1}`, padX + plotW, zeroY + 11);
        ctxImp.fillText("n", padX + plotW/2, zeroY + 22);
    }

    function drawFrequencyResponse(coeffs, M, wcVal, win) {
        const w = canvasResp.width / window.devicePixelRatio;
        const h = canvasResp.height / window.devicePixelRatio;
        ctxResp.clearRect(0, 0, w, h);

        const padX = 40;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Grid in dB: +10 dB to -90 dB (span of 100 dB)
        ctxResp.strokeStyle = "rgba(255,255,255,0.06)";
        ctxResp.lineWidth = 1;
        
        for (let i = 0; i <= 5; i++) {
            const y = padY + (i / 5) * plotH;
            ctxResp.beginPath();
            ctxResp.moveTo(padX, y);
            ctxResp.lineTo(w - padX, y);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "8px monospace";
            ctxResp.textAlign = "right";
            const val = 10 - i * 20;
            ctxResp.fillText(`${val} dB`, padX - 5, y + 3);
        }

        // Verticals
        for (let i = 0; i <= 4; i++) {
            const x = padX + (i / 4) * plotW;
            ctxResp.beginPath();
            ctxResp.moveTo(x, padY);
            ctxResp.lineTo(x, padY + plotH);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "8px monospace";
            ctxResp.textAlign = "center";
            const labels = ["0", "\u03c0/4", "\u03c0/2", "3\u03c0/4", "\u03c0"];
            ctxResp.fillText(labels[i], x, padY + plotH + 11);
        }

        // Draw Ideal Cutoff (Yellow dashed)
        ctxResp.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctxResp.lineWidth = 1.2;
        ctxResp.setLineDash([4, 4]);
        ctxResp.beginPath();
        const idealX = padX + wcVal * plotW;
        ctxResp.moveTo(idealX, padY);
        ctxResp.lineTo(idealX, padY + plotH);
        ctxResp.stroke();
        ctxResp.setLineDash([]);

        // Determine limits
        let limitDB = -21;
        let color = "#ef4444";
        let mainLobe = 4 / M;
        let pbRipple = "~0.74 dB";
        let stopbandAtten = "-21 dB";

        if (win === "hann") {
            limitDB = -44;
            color = "#10b981";
            mainLobe = 8 / M;
            pbRipple = "~0.05 dB";
            stopbandAtten = "-44 dB";
        } else if (win === "hamming") {
            limitDB = -53;
            color = "#a78bfa";
            mainLobe = 8 / M;
            pbRipple = "~0.02 dB";
            stopbandAtten = "-53 dB";
        } else if (win === "blackman") {
            limitDB = -74;
            color = "#fb7185";
            mainLobe = 12 / M;
            pbRipple = "~0.0007 dB";
            stopbandAtten = "-74 dB";
        }

        // Draw Limit marker line
        const normLimit = (limitDB - 10) / -100; // 0 to 1
        const limitY = padY + normLimit * plotH;
        ctxResp.strokeStyle = color + "4D"; // 30% alpha hex
        ctxResp.lineWidth = 1;
        ctxResp.setLineDash([2, 3]);
        ctxResp.beginPath();
        ctxResp.moveTo(padX, limitY);
        ctxResp.lineTo(w - padX, limitY);
        ctxResp.stroke();
        ctxResp.setLineDash([]);

        ctxResp.fillStyle = color;
        ctxResp.font = "7px sans-serif";
        ctxResp.textAlign = "left";
        ctxResp.fillText(`Sidelobe Limit (${limitDB} dB)`, padX + 5, limitY - 4);

        // Calculate actual response points
        const numPoints = 120;
        const resp_db = [];

        for (let i = 0; i < numPoints; i++) {
            const freq = (i / (numPoints - 1)) * Math.PI;
            let real = 0;
            let imag = 0;
            for (let n = 0; n < M; n++) {
                real += coeffs[n] * Math.cos(-freq * n);
                imag += coeffs[n] * Math.sin(-freq * n);
            }
            const mag = Math.sqrt(real * real + imag * imag);
            const dbVal = 20 * Math.log10(Math.max(1e-5, mag)); // floor to -100dB
            resp_db.push(dbVal);
        }

        // Plot curve
        ctxResp.strokeStyle = color;
        ctxResp.lineWidth = 1.8;
        ctxResp.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const px = padX + (i / (numPoints - 1)) * plotW;
            const dbVal = resp_db[i];
            const clamped = Math.max(-90, Math.min(10, dbVal));
            const norm = (clamped - 10) / -100; // 0 to 1
            const py = padY + norm * plotH;

            if (i === 0) {
                ctxResp.moveTo(px, py);
            } else {
                ctxResp.lineTo(px, py);
            }
        }
        ctxResp.stroke();

        // Update metrics
        valMetrics.innerHTML = `
            Main Lobe Width: ${mainLobe.toFixed(3)}\u03c0 rad<br>
            Passband Ripple: ${pbRipple}<br>
            Stopband Attenuation: ${stopbandAtten}
        `;
    }

    selectWin.addEventListener("change", draw);
    sliderWc.addEventListener("input", draw);
    sliderM.addEventListener("input", draw);

    draw();
}

// ============================================================================
// 31. FIR Frequency Sampling Design Simulator (Lecture 24)
// ============================================================================
function initFrequencySamplingSimulator() {
    const sliderM = document.getElementById("slider-l24-m");
    const sliderKc = document.getElementById("slider-l24-kc");
    const sliderT1 = document.getElementById("slider-l24-t1");

    const valM = document.getElementById("val-l24-m");
    const valKc = document.getElementById("val-l24-kc");
    const valT1 = document.getElementById("val-l24-t1");
    const valMetrics = document.getElementById("val-l24-metrics");

    const canvasSamp = document.getElementById("canvas-l24-samples");
    const canvasImp = document.getElementById("canvas-l24-impulse");
    const canvasResp = document.getElementById("canvas-l24-response");

    if (!sliderM || !canvasSamp || !canvasImp || !canvasResp) return;

    const ctxSamp = canvasSamp.getContext("2d");
    const ctxImp = canvasImp.getContext("2d");
    const ctxResp = canvasResp.getContext("2d");

    function resize() {
        canvasSamp.width = canvasSamp.parentElement.clientWidth * window.devicePixelRatio;
        canvasSamp.height = 110 * window.devicePixelRatio;
        ctxSamp.resetTransform();
        ctxSamp.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasImp.width = canvasImp.parentElement.clientWidth * window.devicePixelRatio;
        canvasImp.height = 110 * window.devicePixelRatio;
        ctxImp.resetTransform();
        ctxImp.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasResp.width = canvasResp.parentElement.clientWidth * window.devicePixelRatio;
        canvasResp.height = 230 * window.devicePixelRatio;
        ctxResp.resetTransform();
        ctxResp.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const M = parseInt(sliderM.value);
        const maxKc = Math.floor((M - 3) / 2);
        
        // Dynamically update Kc slider limits
        sliderKc.max = maxKc;
        let kc = parseInt(sliderKc.value);
        if (kc > maxKc) {
            kc = maxKc;
            sliderKc.value = kc;
        }

        const T1 = parseFloat(sliderT1.value);

        valM.innerText = M;
        valKc.innerText = kc;
        valT1.innerText = T1.toFixed(2);

        // Build DFT magnitude samples H_mag [0 ... M-1]
        const H_mag = new Array(M).fill(0);
        const half = (M - 1) / 2;
        
        for (let k = 0; k <= half; k++) {
            if (k <= kc) {
                H_mag[k] = 1.0;
            } else if (k === kc + 1) {
                H_mag[k] = T1;
            } else {
                H_mag[k] = 0.0;
            }
        }
        // Mirror for symmetry
        for (let k = half + 1; k < M; k++) {
            H_mag[k] = H_mag[M - k];
        }

        // Calculate impulse response h[n] using real IDFT formula
        const alpha = (M - 1) / 2;
        const h_coeffs = new Array(M).fill(0);
        for (let n = 0; n < M; n++) {
            let val = H_mag[0];
            for (let k = 1; k <= half; k++) {
                val += 2 * H_mag[k] * Math.cos((2 * Math.PI * k * (n - alpha)) / M);
            }
            h_coeffs[n] = val / M;
        }

        // Draw plots
        drawSamples(H_mag, M, kc);
        drawImpulse(h_coeffs, M);
        drawResponse(h_coeffs, M, kc, T1);
    }

    function drawSamples(H_mag, M, kc) {
        const w = canvasSamp.width / window.devicePixelRatio;
        const h = canvasSamp.height / window.devicePixelRatio;
        ctxSamp.clearRect(0, 0, w, h);

        const padX = 25;
        const padY = 15;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        const zeroY = padY + plotH;

        // Draw stem lines for H_mag
        ctxSamp.lineWidth = 1.2;
        for (let k = 0; k < M; k++) {
            const x = padX + (k / (M - 1)) * plotW;
            const val = H_mag[k];
            const py = zeroY - val * (plotH * 0.9);

            ctxSamp.beginPath();
            ctxSamp.moveTo(x, zeroY);
            ctxSamp.lineTo(x, py);

            if (k === kc + 1 || k === M - 1 - kc - 1) {
                ctxSamp.strokeStyle = "#10b981"; // green transition sample
                ctxSamp.stroke();
                ctxSamp.fillStyle = "#10b981";
            } else {
                ctxSamp.strokeStyle = "#3b82f6"; // blue standard sample
                ctxSamp.stroke();
                ctxSamp.fillStyle = "#60a5fa";
            }

            ctxSamp.beginPath();
            ctxSamp.arc(x, py, 2.5, 0, 2 * Math.PI);
            ctxSamp.fill();
        }

        // Axis label
        ctxSamp.fillStyle = "rgba(255,255,255,0.4)";
        ctxSamp.font = "8px monospace";
        ctxSamp.textAlign = "center";
        ctxSamp.fillText("0", padX, zeroY + 10);
        ctxSamp.fillText(`${M-1}`, padX + plotW, zeroY + 10);
    }

    function drawImpulse(coeffs, M) {
        const w = canvasImp.width / window.devicePixelRatio;
        const h = canvasImp.height / window.devicePixelRatio;
        ctxImp.clearRect(0, 0, w, h);

        const padX = 25;
        const padY = 15;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        const zeroY = padY + plotH * 0.7; // shift zero line up to fit negative coefficients!

        // Zero line
        ctxImp.strokeStyle = "rgba(255,255,255,0.1)";
        ctxImp.lineWidth = 1;
        ctxImp.beginPath();
        ctxImp.moveTo(padX, zeroY);
        ctxImp.lineTo(w - padX, zeroY);
        ctxImp.stroke();

        ctxImp.lineWidth = 1.2;
        for (let n = 0; n < M; n++) {
            const x = padX + (n / (M - 1)) * plotW;
            const val = coeffs[n];
            const py = zeroY - val * (plotH * 0.6);

            ctxImp.strokeStyle = "#a78bfa";
            ctxImp.beginPath();
            ctxImp.moveTo(x, zeroY);
            ctxImp.lineTo(x, py);
            ctxImp.stroke();

            ctxImp.fillStyle = "#c084fc";
            ctxImp.beginPath();
            ctxImp.arc(x, py, 2.5, 0, 2 * Math.PI);
            ctxImp.fill();
        }

        ctxImp.fillStyle = "rgba(255,255,255,0.4)";
        ctxImp.font = "8px monospace";
        ctxImp.textAlign = "center";
        ctxImp.fillText("0", padX, zeroY + 10);
        ctxImp.fillText(`${M-1}`, padX + plotW, zeroY + 10);
    }

    function drawResponse(coeffs, M, kc, T1) {
        const w = canvasResp.width / window.devicePixelRatio;
        const h = canvasResp.height / window.devicePixelRatio;
        ctxResp.clearRect(0, 0, w, h);

        const padX = 40;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Grid in dB: +10 dB to -60 dB
        ctxResp.strokeStyle = "rgba(255,255,255,0.06)";
        ctxResp.lineWidth = 1;
        
        for (let i = 0; i <= 7; i++) {
            const y = padY + (i / 7) * plotH;
            ctxResp.beginPath();
            ctxResp.moveTo(padX, y);
            ctxResp.lineTo(w - padX, y);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "8px monospace";
            ctxResp.textAlign = "right";
            const val = 10 - i * 10;
            ctxResp.fillText(`${val} dB`, padX - 5, y + 3);
        }

        // Verticals
        for (let i = 0; i <= 4; i++) {
            const x = padX + (i / 4) * plotW;
            ctxResp.beginPath();
            ctxResp.moveTo(x, padY);
            ctxResp.lineTo(x, padY + plotH);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "8px monospace";
            ctxResp.textAlign = "center";
            const labels = ["0", "\u03c0/4", "\u03c0/2", "3\u03c0/4", "\u03c0"];
            ctxResp.fillText(labels[i], x, padY + plotH + 11);
        }

        // Calculate continuous response
        const numPoints = 180;
        const resp_db = [];
        let maxStopband = -100;
        
        // Stopband starts at: omega_sb = 2*pi*(kc + 1.5)/M
        const omega_sb = (2 * Math.PI * (kc + 1.5)) / M;

        for (let i = 0; i < numPoints; i++) {
            const freq = (i / (numPoints - 1)) * Math.PI;
            let real = 0;
            let imag = 0;
            for (let n = 0; n < M; n++) {
                real += coeffs[n] * Math.cos(-freq * n);
                imag += coeffs[n] * Math.sin(-freq * n);
            }
            const mag = Math.sqrt(real * real + imag * imag);
            const dbVal = 20 * Math.log10(Math.max(1e-4, mag));
            resp_db.push(dbVal);

            if (freq >= omega_sb && dbVal > maxStopband) {
                maxStopband = dbVal;
            }
        }

        // Plot curve
        ctxResp.strokeStyle = "#3b82f6";
        ctxResp.lineWidth = 1.8;
        ctxResp.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const px = padX + (i / (numPoints - 1)) * plotW;
            const dbVal = resp_db[i];
            const clamped = Math.max(-60, Math.min(10, dbVal));
            const norm = (clamped - 10) / -70; // 0 to 1
            const py = padY + norm * plotH;

            if (i === 0) {
                ctxResp.moveTo(px, py);
            } else {
                ctxResp.lineTo(px, py);
            }
        }
        ctxResp.stroke();

        // Overlay discrete sample values as dots on the frequency curve! This is spectacular!
        for (let k = 0; k < M; k++) {
            const freq = (2 * Math.PI * k) / M;
            if (freq <= Math.PI) {
                const px = padX + (freq / Math.PI) * plotW;
                let real = 0;
                let imag = 0;
                for (let n = 0; n < M; n++) {
                    real += coeffs[n] * Math.cos(-freq * n);
                    imag += coeffs[n] * Math.sin(-freq * n);
                }
                const mag = Math.sqrt(real * real + imag * imag);
                const dbVal = 20 * Math.log10(Math.max(1e-4, mag));
                const clamped = Math.max(-60, Math.min(10, dbVal));
                const norm = (clamped - 10) / -70;
                const py = padY + norm * plotH;

                ctxResp.beginPath();
                ctxResp.arc(px, py, 3, 0, 2 * Math.PI);
                ctxResp.fillStyle = (k === kc + 1) ? "#10b981" : "#fb7185";
                ctxResp.fill();
            }
        }

        // Update dashboard metrics
        const cutoffFreq = (2 * Math.PI * (kc + 0.5)) / M;
        valMetrics.innerHTML = `
            Cutoff Frequency: ${(cutoffFreq / Math.PI).toFixed(2)}\u03c0 rad/s<br>
            Stopband Edge: ${((2 * (kc + 1.5)) / M).toFixed(2)}\u03c0 rad/s<br>
            Measured Stopband: ${maxStopband.toFixed(1)} dB
        `;
    }

    sliderM.addEventListener("input", draw);
    sliderKc.addEventListener("input", draw);
    sliderT1.addEventListener("input", draw);

    draw();
}

// ============================================================================
// 32. Moving Average Filter & Z-Plane Simulator (Lecture 25)
// ============================================================================
function initMovingAverageSimulator() {
    const sliderN = document.getElementById("slider-l25-n");
    const valN = document.getElementById("val-l25-n");
    const valMetrics = document.getElementById("val-l25-metrics");

    const canvasZ = document.getElementById("canvas-l25-zplane");
    const canvasResp = document.getElementById("canvas-l25-response");

    if (!sliderN || !canvasZ || !canvasResp) return;

    const ctxZ = canvasZ.getContext("2d");
    const ctxResp = canvasResp.getContext("2d");

    function resize() {
        canvasZ.width = canvasZ.parentElement.clientWidth * window.devicePixelRatio;
        canvasZ.height = 230 * window.devicePixelRatio;
        ctxZ.resetTransform();
        ctxZ.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasResp.width = canvasResp.parentElement.clientWidth * window.devicePixelRatio;
        canvasResp.height = 230 * window.devicePixelRatio;
        ctxResp.resetTransform();
        ctxResp.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const N = parseInt(sliderN.value);
        valN.innerText = N;

        drawZPlane(N);
        drawResponse(N);
    }

    function drawZPlane(N) {
        const w = canvasZ.width / window.devicePixelRatio;
        const h = canvasZ.height / window.devicePixelRatio;
        ctxZ.clearRect(0, 0, w, h);

        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(w, h) * 0.38;

        // Draw Real/Imag Axes
        ctxZ.strokeStyle = "rgba(255,255,255,0.08)";
        ctxZ.lineWidth = 1;
        ctxZ.beginPath();
        ctxZ.moveTo(centerX - radius * 1.25, centerY);
        ctxZ.lineTo(centerX + radius * 1.25, centerY);
        ctxZ.moveTo(centerX, centerY - radius * 1.25);
        ctxZ.lineTo(centerX, centerY + radius * 1.25);
        ctxZ.stroke();

        // Draw Unit Circle
        ctxZ.strokeStyle = "rgba(255,255,255,0.18)";
        ctxZ.setLineDash([4, 4]);
        ctxZ.beginPath();
        ctxZ.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctxZ.stroke();
        ctxZ.setLineDash([]);

        // Draw Poles at Origin (N-1 poles)
        ctxZ.strokeStyle = "#ef4444";
        ctxZ.lineWidth = 1.5;
        const size = 4;
        ctxZ.beginPath();
        ctxZ.moveTo(centerX - size, centerY - size);
        ctxZ.lineTo(centerX + size, centerY + size);
        ctxZ.moveTo(centerX - size, centerY + size);
        ctxZ.lineTo(centerX + size, centerY - size);
        ctxZ.stroke();

        // Label multiplicity of poles at origin
        ctxZ.fillStyle = "#ef4444";
        ctxZ.font = "8px sans-serif";
        ctxZ.textAlign = "left";
        ctxZ.fillText(`x${N-1}`, centerX + 6, centerY - 2);

        // Draw Zeros: e^(j 2pi k / N) for k=1 to N-1
        ctxZ.lineWidth = 1.5;
        for (let k = 1; k < N; k++) {
            const angle = (2 * Math.PI * k) / N;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY - radius * Math.sin(angle); // canvas y is down

            ctxZ.strokeStyle = "#10b981";
            ctxZ.beginPath();
            ctxZ.arc(x, y, 3, 0, 2 * Math.PI);
            ctxZ.stroke();
        }

        // Draw Canceled Pole/Zero at z=1 (x=1, y=0)
        const cx = centerX + radius;
        const cy = centerY;
        // Draw grey circle (Zero) and cross (Pole) overlapping
        ctxZ.strokeStyle = "#6b7280";
        ctxZ.beginPath();
        ctxZ.arc(cx, cy, 4.5, 0, 2 * Math.PI);
        ctxZ.stroke();

        ctxZ.beginPath();
        ctxZ.moveTo(cx - 3, cy - 3);
        ctxZ.lineTo(cx + 3, cy + 3);
        ctxZ.moveTo(cx - 3, cy + 3);
        ctxZ.lineTo(cx + 3, cy - 3);
        ctxZ.stroke();

        // Label cancellation
        ctxZ.fillStyle = "#9ca3af";
        ctxZ.font = "7px sans-serif";
        ctxZ.textAlign = "center";
        ctxZ.fillText("Canceled", cx, cy - 7);
    }

    function drawResponse(N) {
        const w = canvasResp.width / window.devicePixelRatio;
        const h = canvasResp.height / window.devicePixelRatio;
        ctxResp.clearRect(0, 0, w, h);

        const padX = 40;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Grid lines (Magnitude from 0.0 to 1.1)
        ctxResp.strokeStyle = "rgba(255,255,255,0.06)";
        ctxResp.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padY + (i / 5) * plotH;
            ctxResp.beginPath();
            ctxResp.moveTo(padX, y);
            ctxResp.lineTo(w - padX, y);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "8px monospace";
            ctxResp.textAlign = "right";
            const val = 1.0 - i * 0.2;
            if (val >= 0) {
                ctxResp.fillText(val.toFixed(1), padX - 5, y + 3);
            }
        }

        // Verticals
        for (let i = 0; i <= 4; i++) {
            const x = padX + (i / 4) * plotW;
            ctxResp.beginPath();
            ctxResp.moveTo(x, padY);
            ctxResp.lineTo(x, padY + plotH);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "8px monospace";
            ctxResp.textAlign = "center";
            const labels = ["0", "\u03c0/4", "\u03c0/2", "3\u03c0/4", "\u03c0"];
            ctxResp.fillText(labels[i], x, padY + plotH + 11);
        }

        // Calculate Dirichlet response points
        const numPoints = 200;
        const responsePoints = [];
        for (let i = 0; i < numPoints; i++) {
            const freq = (i / (numPoints - 1)) * Math.PI;
            let val = 0;
            if (freq === 0) {
                val = 1.0;
            } else {
                val = Math.abs(Math.sin(freq * N / 2) / (N * Math.sin(freq / 2)));
            }
            responsePoints.push(val);
        }

        // Plot curve
        ctxResp.strokeStyle = "#3b82f6";
        ctxResp.lineWidth = 1.8;
        ctxResp.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const px = padX + (i / (numPoints - 1)) * plotW;
            const val = responsePoints[i];
            const py = padY + (1.0 - val / 1.1) * plotH;

            if (i === 0) {
                ctxResp.moveTo(px, py);
            } else {
                ctxResp.lineTo(px, py);
            }
        }
        ctxResp.stroke();

        // Draw vertical red dotted lines for nulls (omega = 2*pi*k/N)
        ctxResp.strokeStyle = "rgba(239, 68, 68, 0.4)";
        ctxResp.lineWidth = 1;
        ctxResp.setLineDash([2, 3]);
        for (let k = 1; k < N; k++) {
            const freq = (2 * Math.PI * k) / N;
            if (freq <= Math.PI) {
                const px = padX + (freq / Math.PI) * plotW;
                ctxResp.beginPath();
                ctxResp.moveTo(px, padY);
                ctxResp.lineTo(px, padY + plotH);
                ctxResp.stroke();
            }
        }
        ctxResp.setLineDash([]);

        // Update dashboard metrics
        const firstNull = (2 * Math.PI) / N;
        valMetrics.innerHTML = `
            Poles at Origin: ${N - 1}<br>
            Zeros on Circle: ${N - 1}<br>
            First Null: ${(firstNull / Math.PI).toFixed(3)}\u03c0 rad
        `;
    }

    sliderN.addEventListener("input", draw);
    draw();
}

// ============================================================================
// 33. Analog Filter Prototype Simulator (Lecture 26)
// ============================================================================
function initAnalogPrototypeSimulator() {
    const selectApprox = document.getElementById("select-l26-approx");
    const sliderN = document.getElementById("slider-l26-n");
    const sliderAp = document.getElementById("slider-l26-ap");

    const groupAp = document.getElementById("group-l26-ap");

    const valN = document.getElementById("val-l26-n");
    const valAp = document.getElementById("val-l26-ap");
    const valMetrics = document.getElementById("val-l26-metrics");

    const canvasS = document.getElementById("canvas-l26-splane");
    const canvasResp = document.getElementById("canvas-l26-response");

    if (!selectApprox || !canvasS || !canvasResp) return;

    const ctxS = canvasS.getContext("2d");
    const ctxResp = canvasResp.getContext("2d");

    function resize() {
        canvasS.width = canvasS.parentElement.clientWidth * window.devicePixelRatio;
        canvasS.height = 230 * window.devicePixelRatio;
        ctxS.resetTransform();
        ctxS.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasResp.width = canvasResp.parentElement.clientWidth * window.devicePixelRatio;
        canvasResp.height = 230 * window.devicePixelRatio;
        ctxResp.resetTransform();
        ctxResp.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function getPoles(approx, N, ap) {
        const poles = [];
        if (approx === "butterworth") {
            const wc = 1.0;
            for (let k = 1; k <= N; k++) {
                const angle = Math.PI * (0.5 + (2 * k - 1) / (2 * N));
                poles.push({
                    real: wc * Math.cos(angle),
                    imag: wc * Math.sin(angle)
                });
            }
        } else {
            // Chebyshev Type I
            const epsilon = Math.sqrt(Math.pow(10, 0.1 * ap) - 1);
            // arcsinh(x) = ln(x + sqrt(x^2 + 1))
            const arcsinh = (x) => Math.log(x + Math.sqrt(x * x + 1));
            const phi = arcsinh(1 / epsilon) / N;

            const sinh = Math.sinh(phi);
            const cosh = Math.cosh(phi);

            for (let k = 1; k <= N; k++) {
                const angle = Math.PI * (2 * k - 1) / (2 * N);
                poles.push({
                    real: -sinh * Math.sin(angle),
                    imag: cosh * Math.cos(angle)
                });
            }
        }
        return poles;
    }

    function draw() {
        const approx = selectApprox.value;
        const N = parseInt(sliderN.value);
        const ap = parseFloat(sliderAp.value);

        valN.innerText = N;
        valAp.innerText = ap.toFixed(1);

        if (approx === "chebyshev") {
            groupAp.style.display = "block";
        } else {
            groupAp.style.display = "none";
        }

        const poles = getPoles(approx, N, ap);

        drawSPlane(poles, approx, N, ap);
        drawResponse(approx, N, ap, poles);
    }

    function drawSPlane(poles, approx, N, ap) {
        const w = canvasS.width / window.devicePixelRatio;
        const h = canvasS.height / window.devicePixelRatio;
        ctxS.clearRect(0, 0, w, h);

        const centerX = w / 2;
        const centerY = h / 2;
        
        // Find scaling: poles can be slightly outside 1.0 (cosh(phi) > 1.0 for Chebyshev)
        let maxVal = 1.25;
        if (approx === "chebyshev") {
            const epsilon = Math.sqrt(Math.pow(10, 0.1 * ap) - 1);
            const arcsinh = (x) => Math.log(x + Math.sqrt(x * x + 1));
            const phi = arcsinh(1 / epsilon) / N;
            maxVal = Math.max(1.25, Math.cosh(phi) * 1.05);
        }

        const radius = Math.min(w, h) * 0.4 / (maxVal / 1.25);

        // Draw Real/Imag Axes
        ctxS.strokeStyle = "rgba(255,255,255,0.08)";
        ctxS.lineWidth = 1;
        ctxS.beginPath();
        ctxS.moveTo(centerX - radius * maxVal, centerY);
        ctxS.lineTo(centerX + radius * maxVal, centerY);
        ctxS.moveTo(centerX, centerY - radius * maxVal);
        ctxS.lineTo(centerX, centerY + radius * maxVal);
        ctxS.stroke();

        // Label Axes
        ctxS.fillStyle = "rgba(255,255,255,0.3)";
        ctxS.font = "8px sans-serif";
        ctxS.textAlign = "right";
        ctxS.fillText("\u03c3", centerX + radius * maxVal - 5, centerY - 5);
        ctxS.textAlign = "left";
        ctxS.fillText("j\u03a9", centerX + 5, centerY - radius * maxVal + 10);

        // Draw Guideline curve (Circle for Butterworth, Ellipse for Chebyshev)
        ctxS.strokeStyle = "rgba(255,255,255,0.12)";
        ctxS.setLineDash([3, 3]);
        ctxS.beginPath();
        if (approx === "butterworth") {
            ctxS.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        } else {
            const epsilon = Math.sqrt(Math.pow(10, 0.1 * ap) - 1);
            const arcsinh = (x) => Math.log(x + Math.sqrt(x * x + 1));
            const phi = arcsinh(1 / epsilon) / N;
            const semiMinor = Math.sinh(phi) * radius;
            const semiMajor = Math.cosh(phi) * radius;
            ctxS.ellipse(centerX, centerY, semiMinor, semiMajor, 0, 0, 2 * Math.PI);
        }
        ctxS.stroke();
        ctxS.setLineDash([]);

        // Plot Poles as red crosses
        ctxS.strokeStyle = approx === "butterworth" ? "#3b82f6" : "#10b981";
        ctxS.lineWidth = 1.8;
        const size = 4;
        poles.forEach(p => {
            const px = centerX + p.real * radius;
            const py = centerY - p.imag * radius; // invert imag axis

            ctxS.beginPath();
            ctxS.moveTo(px - size, py - size);
            ctxS.lineTo(px + size, py + size);
            ctxS.moveTo(px - size, py + size);
            ctxS.lineTo(px + size, py - size);
            ctxS.stroke();
        });
    }

    function drawResponse(approx, N, ap, poles) {
        const w = canvasResp.width / window.devicePixelRatio;
        const h = canvasResp.height / window.devicePixelRatio;
        ctxResp.clearRect(0, 0, w, h);

        const padX = 40;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Grid lines (Magnitude from 0.0 to 1.1)
        ctxResp.strokeStyle = "rgba(255,255,255,0.06)";
        ctxResp.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padY + (i / 5) * plotH;
            ctxResp.beginPath();
            ctxResp.moveTo(padX, y);
            ctxResp.lineTo(w - padX, y);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "8px monospace";
            ctxResp.textAlign = "right";
            const val = 1.0 - i * 0.2;
            if (val >= 0) {
                ctxResp.fillText(val.toFixed(1), padX - 5, y + 3);
            }
        }

        // Verticals: Frequency \Omega from 0 to 3.0 rad/s
        for (let i = 0; i <= 6; i++) {
            const x = padX + (i / 6) * plotW;
            ctxResp.beginPath();
            ctxResp.moveTo(x, padY);
            ctxResp.lineTo(x, padY + plotH);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "8px monospace";
            ctxResp.textAlign = "center";
            const val = (i * 0.5);
            ctxResp.fillText(val.toFixed(1), x, padY + plotH + 11);
        }

        // Draw passband edge (dashed line at \Omega = 1)
        ctxResp.strokeStyle = "rgba(255,255,255,0.18)";
        ctxResp.setLineDash([3, 3]);
        ctxResp.beginPath();
        ctxResp.moveTo(padX + (1.0 / 3.0) * plotW, padY);
        ctxResp.lineTo(padX + (1.0 / 3.0) * plotW, padY + plotH);
        ctxResp.stroke();
        ctxResp.setLineDash([]);

        // Calculate Response
        const numPoints = 150;
        const responsePoints = [];

        if (approx === "butterworth") {
            for (let i = 0; i < numPoints; i++) {
                const om = (i / (numPoints - 1)) * 3.0;
                const mag = 1.0 / Math.sqrt(1 + Math.pow(om, 2 * N));
                responsePoints.push(mag);
            }
        } else {
            // Chebyshev Type I
            const epsilon = Math.sqrt(Math.pow(10, 0.1 * ap) - 1);
            for (let i = 0; i < numPoints; i++) {
                const om = (i / (numPoints - 1)) * 3.0;
                let c_n = 0;
                if (om <= 1.0) {
                    c_n = Math.cos(N * Math.acos(om));
                } else {
                    c_n = Math.cosh(N * Math.acosh(om));
                }
                const mag = 1.0 / Math.sqrt(1 + epsilon * epsilon * c_n * c_n);
                responsePoints.push(mag);
            }
        }

        // Plot Curve
        ctxResp.strokeStyle = approx === "butterworth" ? "#3b82f6" : "#10b981";
        ctxResp.lineWidth = 1.8;
        ctxResp.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const px = padX + (i / (numPoints - 1)) * plotW;
            const val = responsePoints[i];
            const py = padY + (1.0 - val / 1.1) * plotH;

            if (i === 0) {
                ctxResp.moveTo(px, py);
            } else {
                ctxResp.lineTo(px, py);
            }
        }
        ctxResp.stroke();

        // Calculate quantitative comparison at \Omega_s = 2.0 (for metrics)
        let attenStopband = 0;
        if (approx === "butterworth") {
            const magStop = 1.0 / Math.sqrt(1 + Math.pow(2.0, 2 * N));
            attenStopband = 20 * Math.log10(magStop);
        } else {
            const epsilon = Math.sqrt(Math.pow(10, 0.1 * ap) - 1);
            const c_n = Math.cosh(N * Math.acosh(2.0));
            const magStop = 1.0 / Math.sqrt(1 + epsilon * epsilon * c_n * c_n);
            attenStopband = 20 * Math.log10(magStop);
        }

        const rollOffRate = approx === "butterworth" ? -6 * N : -6 * N - 12; // approximate Chebyshev slope
        valMetrics.innerHTML = `
            Prototype: ${approx === "butterworth" ? "Butterworth" : "Chebyshev I"}<br>
            Cutoff/Ripple Edge: 1.00 rad/s<br>
            Stopband Gain (at \u03a9=2): ${attenStopband.toFixed(1)} dB
        `;
    }

    selectApprox.addEventListener("change", draw);
    sliderN.addEventListener("input", draw);
    sliderAp.addEventListener("input", draw);

    draw();
}

// ============================================================================
// 34. Impulse Invariance Method Simulator (Lecture 27)
// ============================================================================
function initImpulseInvarianceSimulator() {
    const sliderTd = document.getElementById("slider-l27-td");
    const sliderW0 = document.getElementById("slider-l27-w0");

    const valTd = document.getElementById("val-l27-td");
    const valW0 = document.getElementById("val-l27-w0");
    const valMetrics = document.getElementById("val-l27-metrics");

    const canvasS = document.getElementById("canvas-l27-splane");
    const canvasZ = document.getElementById("canvas-l27-zplane");
    const canvasResp = document.getElementById("canvas-l27-response");

    if (!sliderTd || !sliderW0 || !canvasS || !canvasZ || !canvasResp) return;

    const ctxS = canvasS.getContext("2d");
    const ctxZ = canvasZ.getContext("2d");
    const ctxResp = canvasResp.getContext("2d");

    function resize() {
        const wS = canvasS.parentElement.clientWidth * window.devicePixelRatio;
        const hS = 180 * window.devicePixelRatio;

        canvasS.width = wS;
        canvasS.height = hS;
        ctxS.resetTransform();
        ctxS.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasZ.width = wS;
        canvasZ.height = hS;
        ctxZ.resetTransform();
        ctxZ.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasResp.width = wS;
        canvasResp.height = hS;
        ctxResp.resetTransform();
        ctxResp.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const Td = parseFloat(sliderTd.value);
        const w0 = parseFloat(sliderW0.value);

        valTd.innerText = Td.toFixed(2);
        valW0.innerText = w0.toFixed(1);

        // Analog Pole at s = -1.0 \pm j w0
        const sigma0 = -1.0;
        
        // Mapped Digital Pole: z = e^(s * Td) = e^(-Td) * e^(j * w0 * Td)
        const r = Math.exp(sigma0 * Td);
        const theta = w0 * Td; // digital frequency in radians

        drawSPlane(sigma0, w0, Td);
        drawZPlane(r, theta);
        drawResponse(r, theta, Td, w0);
    }

    function drawSPlane(sigma0, w0, Td) {
        const w = canvasS.width / window.devicePixelRatio;
        const h = canvasS.height / window.devicePixelRatio;
        ctxS.clearRect(0, 0, w, h);

        const centerX = w / 2 + 10; // offset right slightly to see LHP better
        const centerY = h / 2;
        
        // Grid Scale: s-plane coordinates. We want to show sigma from -3 to +1.5, Omega from -16 to +16.
        const scaleX = 25;
        const scaleY = 4.5; // smaller scale for frequency because it goes up to 15

        // Draw Axes
        ctxS.strokeStyle = "rgba(255,255,255,0.08)";
        ctxS.lineWidth = 1;
        ctxS.beginPath();
        ctxS.moveTo(0, centerY);
        ctxS.lineTo(w, centerY);
        ctxS.moveTo(centerX, 0);
        ctxS.lineTo(centerX, h);
        ctxS.stroke();

        // Draw Nyquist Boundary lines in s-plane: Omega = \pm \pi / Td
        const nyquistLimit = Math.PI / Td;
        ctxS.strokeStyle = "rgba(239, 68, 68, 0.4)";
        ctxS.setLineDash([3, 4]);
        ctxS.lineWidth = 1;

        const yNyqPlus = centerY - nyquistLimit * scaleY;
        const yNyqMinus = centerY + nyquistLimit * scaleY;

        ctxS.beginPath();
        ctxS.moveTo(0, yNyqPlus);
        ctxS.lineTo(w, yNyqPlus);
        ctxS.moveTo(0, yNyqMinus);
        ctxS.lineTo(w, yNyqMinus);
        ctxS.stroke();
        ctxS.setLineDash([]);

        // Label Nyquist boundaries
        ctxS.fillStyle = "rgba(239, 68, 68, 0.7)";
        ctxS.font = "7px sans-serif";
        ctxS.textAlign = "left";
        if (yNyqPlus > 2) {
            ctxS.fillText(`+\u03c0/Td (${nyquistLimit.toFixed(1)})`, 5, yNyqPlus - 3);
        }
        if (yNyqMinus < h - 2) {
            ctxS.fillText(`-\u03c0/Td (-${nyquistLimit.toFixed(1)})`, 5, yNyqMinus + 8);
        }

        // Plot Analog Poles as blue crosses
        ctxS.strokeStyle = "#3b82f6";
        ctxS.lineWidth = 1.8;
        const size = 4;
        
        const px = centerX + sigma0 * scaleX;
        const py1 = centerY - w0 * scaleY;
        const py2 = centerY + w0 * scaleY;

        ctxS.beginPath();
        ctxS.moveTo(px - size, py1 - size); ctxS.lineTo(px + size, py1 + size);
        ctxS.moveTo(px - size, py1 + size); ctxS.lineTo(px + size, py1 - size);
        ctxS.moveTo(px - size, py2 - size); ctxS.lineTo(px + size, py2 + size);
        ctxS.moveTo(px - size, py2 + size); ctxS.lineTo(px + size, py2 - size);
        ctxS.stroke();

        ctxS.fillStyle = "rgba(255,255,255,0.4)";
        ctxS.font = "8px sans-serif";
        ctxS.textAlign = "right";
        ctxS.fillText("\u03c3", w - 5, centerY - 4);
        ctxS.fillText("j\u03a9", centerX - 4, 10);
    }

    function drawZPlane(r, theta) {
        const w = canvasZ.width / window.devicePixelRatio;
        const h = canvasZ.height / window.devicePixelRatio;
        ctxZ.clearRect(0, 0, w, h);

        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(w, h) * 0.4;

        // Draw Axes
        ctxZ.strokeStyle = "rgba(255,255,255,0.08)";
        ctxZ.lineWidth = 1;
        ctxZ.beginPath();
        ctxZ.moveTo(centerX - radius * 1.2, centerY);
        ctxZ.lineTo(centerX + radius * 1.2, centerY);
        ctxZ.moveTo(centerX, centerY - radius * 1.2);
        ctxZ.lineTo(centerX, centerY + radius * 1.2);
        ctxZ.stroke();

        // Draw Unit Circle
        ctxZ.strokeStyle = "rgba(255,255,255,0.2)";
        ctxZ.beginPath();
        ctxZ.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctxZ.stroke();

        // Plot Mapped Digital Poles as green crosses
        ctxZ.strokeStyle = "#10b981";
        ctxZ.lineWidth = 1.8;
        const size = 4;

        const px1 = centerX + r * Math.cos(theta) * radius;
        const py1 = centerY - r * Math.sin(theta) * radius;
        const px2 = centerX + r * Math.cos(-theta) * radius;
        const py2 = centerY - r * Math.sin(-theta) * radius;

        ctxZ.beginPath();
        ctxZ.moveTo(px1 - size, py1 - size); ctxZ.lineTo(px1 + size, py1 + size);
        ctxZ.moveTo(px1 - size, py1 + size); ctxZ.lineTo(px1 + size, py1 - size);
        ctxZ.moveTo(px2 - size, py2 - size); ctxZ.lineTo(px2 + size, py2 + size);
        ctxZ.moveTo(px2 - size, py2 + size); ctxZ.lineTo(px2 + size, py2 - size);
        ctxZ.stroke();

        // Label Axes
        ctxZ.fillStyle = "rgba(255,255,255,0.4)";
        ctxZ.font = "8px sans-serif";
        ctxZ.textAlign = "right";
        ctxZ.fillText("Re", centerX + radius * 1.2 - 5, centerY - 4);
        ctxZ.fillText("Im", centerX - 4, centerY - radius * 1.2 + 8);
    }

    function drawResponse(r, theta, Td, w0) {
        const w = canvasResp.width / window.devicePixelRatio;
        const h = canvasResp.height / window.devicePixelRatio;
        ctxResp.clearRect(0, 0, w, h);

        const padX = 35;
        const padY = 15;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Grid lines (Magnitude from -50 dB to +10 dB)
        ctxResp.strokeStyle = "rgba(255,255,255,0.06)";
        ctxResp.lineWidth = 1;
        for (let i = 0; i <= 6; i++) {
            const y = padY + (i / 6) * plotH;
            ctxResp.beginPath();
            ctxResp.moveTo(padX, y);
            ctxResp.lineTo(w - padX, y);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "7px monospace";
            ctxResp.textAlign = "right";
            const val = 10 - i * 10;
            ctxResp.fillText(`${val}dB`, padX - 5, y + 2.5);
        }

        // Verticals: discrete frequency \omega from 0 to \pi
        for (let i = 0; i <= 4; i++) {
            const x = padX + (i / 4) * plotW;
            ctxResp.beginPath();
            ctxResp.moveTo(x, padY);
            ctxResp.lineTo(x, padY + plotH);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "7px monospace";
            ctxResp.textAlign = "center";
            const labels = ["0", "\u03c0/4", "\u03c0/2", "3\u03c0/4", "\u03c0"];
            ctxResp.fillText(labels[i], x, padY + plotH + 9);
        }

        // Calculate discrete response: H(e^jw) = 1 / [(1 - r*e^jt * e^-jw)(1 - r*e^-jt * e^-jw)]
        const numPoints = 120;
        const dbVals = [];
        let maxDb = -Infinity;

        for (let i = 0; i < numPoints; i++) {
            const omega = (i / (numPoints - 1)) * Math.PI;
            // denominator = 1 - 2*r*cos(theta)*e^-jw + r^2 * e^-2jw
            // Real part: 1 - 2*r*cos(theta)*cos(omega) + r^2 * cos(2*omega)
            // Imag part: 2*r*cos(theta)*sin(omega) - r^2 * sin(2*omega)
            const cosT = Math.cos(theta);
            const re = 1.0 - 2.0 * r * cosT * Math.cos(omega) + r * r * Math.cos(2.0 * omega);
            const im = 2.0 * r * cosT * Math.sin(omega) - r * r * Math.sin(2.0 * omega);
            const magnitude = 1.0 / Math.sqrt(re * re + im * im);
            const db = 20 * Math.log10(magnitude);
            dbVals.push(db);
            if (db > maxDb) maxDb = db;
        }

        // Plot digital response curve (normalized so peak is around its own scale or unnormalized to show gain change)
        // Let's show unnormalized to display the gain scaling by Td or keep peak bounded. 
        // We will normalize to 0 dB peak to let the shape comparison be clean.
        ctxResp.strokeStyle = "#10b981";
        ctxResp.lineWidth = 1.8;
        ctxResp.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const px = padX + (i / (numPoints - 1)) * plotW;
            const dbNorm = dbVals[i] - maxDb; // peak at 0 dB
            const py = padY + (1.0 - (dbNorm + 50) / 60) * plotH; // clamp -50dB to +10dB

            const clampedPy = Math.max(padY, Math.min(padY + plotH, py));

            if (i === 0) {
                ctxResp.moveTo(px, clampedPy);
            } else {
                ctxResp.lineTo(px, clampedPy);
            }
        }
        ctxResp.stroke();

        // Calculate if aliasing is present
        const nyquistLimit = Math.PI / Td;
        const aliased = w0 > nyquistLimit;
        
        let aliasText = "Minimal Aliasing";
        let color = "#10b981";
        if (aliased) {
            aliasText = "SEVERE ALIASING";
            color = "#ef4444";
        }

        valMetrics.innerHTML = `
            Analog Poles: -1.0 \u00b1 j${w0.toFixed(1)}<br>
            Digital Poles: r = ${r.toFixed(3)}, \u03b8 = ${(theta % (2*Math.PI) / Math.PI).toFixed(2)}\u03c0<br>
            Nyquist Limit: ${nyquistLimit.toFixed(1)} rad/s<br>
            Aliasing Status: <span style="color: ${color}; font-weight: bold;">${aliasText}</span>
        `;
    }

    sliderTd.addEventListener("input", draw);
    sliderW0.addEventListener("input", draw);

    draw();
}

// ============================================================================
// 35. Bilinear Transformation Method Simulator (Lecture 28)
// ============================================================================
function initBilinearSimulator() {
    const sliderTd = document.getElementById("slider-l28-td");
    const sliderWc = document.getElementById("slider-l28-wc");

    const valTd = document.getElementById("val-l28-td");
    const valWc = document.getElementById("val-l28-wc");
    const valMetrics = document.getElementById("val-l28-metrics");

    const canvasWarp = document.getElementById("canvas-l28-warping");
    const canvasResp = document.getElementById("canvas-l28-response");

    if (!sliderTd || !sliderWc || !canvasWarp || !canvasResp) return;

    const ctxWarp = canvasWarp.getContext("2d");
    const ctxResp = canvasResp.getContext("2d");

    function resize() {
        const w = canvasWarp.parentElement.clientWidth * window.devicePixelRatio;
        const h = 230 * window.devicePixelRatio;

        canvasWarp.width = w;
        canvasWarp.height = h;
        ctxWarp.resetTransform();
        ctxWarp.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasResp.width = w;
        canvasResp.height = h;
        ctxResp.resetTransform();
        ctxResp.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const Td = parseFloat(sliderTd.value);
        const Omega_c = parseFloat(sliderWc.value);

        valTd.innerText = Td.toFixed(1);
        valWc.innerText = Omega_c.toFixed(1);

        // Calculate digital cutoff frequency: omega_c = 2 * arctan(Omega_c * Td / 2)
        const omega_c = 2 * Math.atan((Omega_c * Td) / 2);

        drawWarping(Td, Omega_c, omega_c);
        drawResponse(Td, Omega_c, omega_c);
    }

    function drawWarping(Td, Omega_c, omega_c) {
        const w = canvasWarp.width / window.devicePixelRatio;
        const h = canvasWarp.height / window.devicePixelRatio;
        ctxWarp.clearRect(0, 0, w, h);

        const padX = 40;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Grid lines (Digital frequency from 0 to \pi)
        ctxWarp.strokeStyle = "rgba(255,255,255,0.06)";
        ctxWarp.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padY + (i / 4) * plotH;
            ctxWarp.beginPath();
            ctxWarp.moveTo(padX, y);
            ctxWarp.lineTo(w - padX, y);
            ctxWarp.stroke();

            // Label
            ctxWarp.fillStyle = "rgba(255,255,255,0.4)";
            ctxWarp.font = "8px monospace";
            ctxWarp.textAlign = "right";
            const labels = ["\u03c0", "3\u03c0/4", "\u03c0/2", "\u03c0/4", "0"];
            ctxWarp.fillText(labels[i], padX - 5, y + 3);
        }

        // Verticals: Analog frequency \Omega from 0 to 10 rad/s
        for (let i = 0; i <= 5; i++) {
            const x = padX + (i / 5) * plotW;
            ctxWarp.beginPath();
            ctxWarp.moveTo(x, padY);
            ctxWarp.lineTo(x, padY + plotH);
            ctxWarp.stroke();

            // Label
            ctxWarp.fillStyle = "rgba(255,255,255,0.4)";
            ctxWarp.font = "8px monospace";
            ctxWarp.textAlign = "center";
            const val = i * 2.0;
            ctxWarp.fillText(val.toFixed(1), x, padY + plotH + 11);
        }

        // Plot linear mapping line (dashed white): omega = Omega * Td
        ctxWarp.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctxWarp.lineWidth = 1;
        ctxWarp.setLineDash([3, 3]);
        ctxWarp.beginPath();
        const maxOmegaLinear = Math.PI / Td;
        for (let i = 0; i <= 50; i++) {
            const om = (i / 50) * maxOmegaLinear;
            if (om <= 10.0) {
                const px = padX + (om / 10.0) * plotW;
                const py = padY + (1.0 - (om * Td) / Math.PI) * plotH;
                if (i === 0) ctxWarp.moveTo(px, py);
                else ctxWarp.lineTo(px, py);
            }
        }
        ctxWarp.stroke();
        ctxWarp.setLineDash([]);

        // Plot Warping Curve: omega = 2 * arctan(Omega * Td / 2)
        ctxWarp.strokeStyle = "#8b5cf6";
        ctxWarp.lineWidth = 2.0;
        ctxWarp.beginPath();
        const numPoints = 100;
        for (let i = 0; i < numPoints; i++) {
            const om = (i / (numPoints - 1)) * 10.0;
            const discreteW = 2 * Math.atan((om * Td) / 2);
            const px = padX + (om / 10.0) * plotW;
            const py = padY + (1.0 - discreteW / Math.PI) * plotH;

            if (i === 0) ctxWarp.moveTo(px, py);
            else ctxWarp.lineTo(px, py);
        }
        ctxWarp.stroke();

        // Highlight current Omega_c point mapping
        const pxCut = padX + (Omega_c / 10.0) * plotW;
        const pyCut = padY + (1.0 - omega_c / Math.PI) * plotH;

        ctxWarp.strokeStyle = "#ef4444";
        ctxWarp.lineWidth = 1;
        ctxWarp.setLineDash([2, 2]);
        ctxWarp.beginPath();
        ctxWarp.moveTo(pxCut, padY + plotH);
        ctxWarp.lineTo(pxCut, pyCut);
        ctxWarp.lineTo(padX, pyCut);
        ctxWarp.stroke();
        ctxWarp.setLineDash([]);

        ctxWarp.fillStyle = "#ef4444";
        ctxWarp.beginPath();
        ctxWarp.arc(pxCut, pyCut, 4, 0, 2 * Math.PI);
        ctxWarp.fill();

        // Label axes
        ctxWarp.fillStyle = "rgba(255,255,255,0.4)";
        ctxWarp.font = "8px sans-serif";
        ctxWarp.textAlign = "right";
        ctxWarp.fillText("\u03a9 (rad/s)", w - 5, padY + plotH + 22);
        ctxWarp.fillText("\u03c9 (rad)", padX - 5, padY - 6);
    }

    function drawResponse(Td, Omega_c, omega_c) {
        const w = canvasResp.width / window.devicePixelRatio;
        const h = canvasResp.height / window.devicePixelRatio;
        ctxResp.clearRect(0, 0, w, h);

        const padX = 40;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Grid lines (Magnitude from 0.0 to 1.1)
        ctxResp.strokeStyle = "rgba(255,255,255,0.06)";
        ctxResp.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padY + (i / 5) * plotH;
            ctxResp.beginPath();
            ctxResp.moveTo(padX, y);
            ctxResp.lineTo(w - padX, y);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "8px monospace";
            ctxResp.textAlign = "right";
            const val = 1.0 - i * 0.2;
            if (val >= 0) {
                ctxResp.fillText(val.toFixed(1), padX - 5, y + 3);
            }
        }

        // Verticals: Digital frequency \omega from 0 to \pi
        for (let i = 0; i <= 4; i++) {
            const x = padX + (i / 4) * plotW;
            ctxResp.beginPath();
            ctxResp.moveTo(x, padY);
            ctxResp.lineTo(x, padY + plotH);
            ctxResp.stroke();

            // Label
            ctxResp.fillStyle = "rgba(255,255,255,0.4)";
            ctxResp.font = "8px monospace";
            ctxResp.textAlign = "center";
            const labels = ["0", "\u03c0/4", "\u03c0/2", "3\u03c0/4", "\u03c0"];
            ctxResp.fillText(labels[i], x, padY + plotH + 11);
        }

        // Plot digital response (Bilinear mapped Butterworth 2nd order):
        // |H(e^jw)| = 1 / sqrt( 1 + ( (2*tan(w/2))/(Td * Omega_c) )^4 )
        const numPoints = 120;
        ctxResp.strokeStyle = "#10b981"; // green
        ctxResp.lineWidth = 1.8;
        ctxResp.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const omega = (i / (numPoints - 1)) * Math.PI;
            
            let mag = 0;
            if (omega === Math.PI) {
                mag = 0;
            } else {
                const continuousW = (2.0 / Td) * Math.tan(omega / 2.0);
                mag = 1.0 / Math.sqrt(1 + Math.pow(continuousW / Omega_c, 4));
            }

            const px = padX + (omega / Math.PI) * plotW;
            const py = padY + (1.0 - mag / 1.1) * plotH;

            if (i === 0) ctxResp.moveTo(px, py);
            else ctxResp.lineTo(px, py);
        }
        ctxResp.stroke();

        // Plot ideal unwarped response (dashed blue):
        // |H_ideal(e^jw)| = 1 / sqrt( 1 + ( w / (Td * Omega_c) )^4 )
        ctxResp.strokeStyle = "#3b82f6"; // blue
        ctxResp.lineWidth = 1.2;
        ctxResp.setLineDash([4, 4]);
        ctxResp.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const omega = (i / (numPoints - 1)) * Math.PI;
            const idealMag = 1.0 / Math.sqrt(1 + Math.pow(omega / (Td * Omega_c), 4));

            const px = padX + (omega / Math.PI) * plotW;
            const py = padY + (1.0 - idealMag / 1.1) * plotH;

            if (i === 0) ctxResp.moveTo(px, py);
            else ctxResp.lineTo(px, py);
        }
        ctxResp.stroke();
        ctxResp.setLineDash([]);

        // Draw vertical red dotted line at actual digital cutoff omega_c
        const pxCut = padX + (omega_c / Math.PI) * plotW;
        ctxResp.strokeStyle = "rgba(239, 68, 68, 0.5)";
        ctxResp.lineWidth = 1;
        ctxResp.setLineDash([2, 2]);
        ctxResp.beginPath();
        ctxResp.moveTo(pxCut, padY);
        ctxResp.lineTo(pxCut, padY + plotH);
        ctxResp.stroke();
        ctxResp.setLineDash([]);

        ctxResp.fillStyle = "#ef4444";
        ctxResp.font = "8px sans-serif";
        ctxResp.textAlign = "left";
        ctxResp.fillText(`Cutoff \u03c5_c (${(omega_c/Math.PI).toFixed(2)}\u03c0)`, pxCut + 3, padY + 12);

        // Update dashboard metrics
        const linearW = Omega_c * Td;
        valMetrics.innerHTML = `
            Analog Cutoff \u03a9_c: ${Omega_c.toFixed(2)} rad/s<br>
            Digital Cutoff \u03c5_c: ${(omega_c/Math.PI).toFixed(3)}\u03c0 rad<br>
            Linear \u03a9_c T_d: ${(linearW/Math.PI).toFixed(3)}\u03c0 rad (Warp Error: ${Math.abs(linearW - omega_c).toFixed(2)} rad)
        `;
    }

    sliderTd.addEventListener("input", draw);
    sliderWc.addEventListener("input", draw);

    draw();
}

// ============================================================================
// 36. Digital Spectral Transformation Simulator (Lecture 29)
// ============================================================================
function initSpectralTransformationSimulator() {
    const selectType = document.getElementById("select-l29-type");
    const sliderWc = document.getElementById("slider-l29-wc");
    const sliderDw = document.getElementById("slider-l29-dw");

    const groupWc = document.getElementById("group-l29-wc");
    const groupDw = document.getElementById("group-l29-dw");

    const valWc = document.getElementById("val-l29-wc");
    const valDw = document.getElementById("val-l29-dw");
    const valMetrics = document.getElementById("val-l29-metrics");

    const canvas = document.getElementById("canvas-l29-response");

    if (!selectType || !sliderWc || !sliderDw || !canvas) return;

    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
        canvas.height = 230 * window.devicePixelRatio;
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    const theta_c = 0.3 * Math.PI; // prototype LPF cutoff

    function getPhase(omega, type, alpha, beta) {
        if (type === "lowpass") {
            const numReal = Math.cos(-omega) - alpha;
            const numImag = Math.sin(-omega);
            const denReal = 1.0 - alpha * Math.cos(-omega);
            const denImag = -alpha * Math.sin(-omega);
            let ph = Math.atan2(numImag, numReal) - Math.atan2(denImag, denReal);
            if (ph < 0) ph += 2 * Math.PI;
            // map [0, 2pi] to [0, pi]
            return ph > Math.PI ? 2 * Math.PI - ph : ph;
        } else if (type === "highpass") {
            const numReal = -(Math.cos(-omega) + alpha);
            const numImag = -Math.sin(-omega);
            const denReal = 1.0 + alpha * Math.cos(-omega);
            const denImag = alpha * Math.sin(-omega);
            let ph = Math.atan2(numImag, numReal) - Math.atan2(denImag, denReal);
            if (ph < 0) ph += 2 * Math.PI;
            return ph > Math.PI ? 2 * Math.PI - ph : ph;
        } else {
            // Bandpass
            const k = (beta - 1) / (beta + 1);
            const c1 = (2 * alpha * beta) / (beta + 1);
            const numReal = -(Math.cos(-2*omega) - c1 * Math.cos(-omega) + k);
            const numImag = -(Math.sin(-2*omega) - c1 * Math.sin(-omega));
            const denReal = k * Math.cos(-2*omega) - c1 * Math.cos(-omega) + 1.0;
            const denImag = k * Math.sin(-2*omega) - c1 * Math.sin(-omega);
            let ph = Math.atan2(numImag, numReal) - Math.atan2(denImag, denReal);
            if (ph < 0) ph += 2 * Math.PI;
            return ph > Math.PI ? 2 * Math.PI - ph : ph;
        }
    }

    function draw() {
        const type = selectType.value;
        const wc = parseFloat(sliderWc.value) * Math.PI;
        const dw = parseFloat(sliderDw.value) * Math.PI;

        valWc.innerText = `${(wc / Math.PI).toFixed(2)}\u03c0`;
        valDw.innerText = `${(dw / Math.PI).toFixed(2)}\u03c0`;

        if (type === "bandpass") {
            groupDw.style.display = "block";
            // Update labels for bandpass
            groupWc.querySelector("label").childNodes[0].nodeValue = "Center Freq \u03c90: ";
        } else {
            groupDw.style.display = "none";
            groupWc.querySelector("label").childNodes[0].nodeValue = "Cutoff Freq \u03c9c: ";
        }

        // Calculate Constantinides parameters
        let alpha = 0;
        let beta = 0;
        if (type === "lowpass") {
            alpha = Math.sin((theta_c - wc) / 2) / Math.sin((theta_c + wc) / 2);
        } else if (type === "highpass") {
            alpha = -Math.cos((theta_c + wc) / 2) / Math.cos((theta_c - wc) / 2);
        } else {
            // Bandpass
            const w1 = wc - dw / 2;
            const w2 = wc + dw / 2;
            alpha = Math.cos((w2 + w1) / 2) / Math.cos((w2 - w1) / 2);
            beta = (1.0 / Math.tan((w2 - w1) / 2)) * Math.tan(theta_c / 2);
        }

        drawPlots(type, alpha, beta, wc, dw);
    }

    function drawPlots(type, alpha, beta, wc, dw) {
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, w, h);

        const padX = 40;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Grid lines (Magnitude from 0.0 to 1.1)
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padY + (i / 5) * plotH;
            ctx.beginPath();
            ctx.moveTo(padX, y);
            ctx.lineTo(w - padX, y);
            ctx.stroke();

            // Label
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "8px monospace";
            ctx.textAlign = "right";
            const val = 1.0 - i * 0.2;
            if (val >= 0) {
                ctx.fillText(val.toFixed(1), padX - 5, y + 3);
            }
        }

        // Verticals: Discrete frequency \omega from 0 to \pi
        for (let i = 0; i <= 4; i++) {
            const x = padX + (i / 4) * plotW;
            ctx.beginPath();
            ctx.moveTo(x, padY);
            ctx.lineTo(x, padY + plotH);
            ctx.stroke();

            // Label
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "8px monospace";
            ctx.textAlign = "center";
            const labels = ["0", "\u03c0/4", "\u03c0/2", "3\u03c0/4", "\u03c0"];
            ctx.fillText(labels[i], x, padY + plotH + 11);
        }

        // 1. Plot Prototype LPF (dashed blue)
        const numPoints = 150;
        ctx.strokeStyle = "rgba(59, 130, 246, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const omega = (i / (numPoints - 1)) * Math.PI;
            // magnitude of 4th-order Butterworth LPF
            const mag = 1.0 / Math.sqrt(1 + Math.pow(Math.tan(omega/2) / Math.tan(theta_c/2), 8));
            const px = padX + (omega / Math.PI) * plotW;
            const py = padY + (1.0 - mag / 1.1) * plotH;

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Plot Transformed Filter (solid colored)
        let color = "#10b981"; // default green for LPF
        if (type === "highpass") color = "#ef4444"; // red
        if (type === "bandpass") color = "#8b5cf6"; // purple

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const omega = (i / (numPoints - 1)) * Math.PI;
            
            // Map target frequency omega back to prototype frequency theta
            const theta = getPhase(omega, type, alpha, beta);
            
            // Evaluate prototype response at theta
            const mag = 1.0 / Math.sqrt(1 + Math.pow(Math.tan(theta/2) / Math.tan(theta_c/2), 8));

            const px = padX + (omega / Math.PI) * plotW;
            const py = padY + (1.0 - mag / 1.1) * plotH;

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Update metrics
        if (type === "bandpass") {
            valMetrics.innerHTML = `
                Type: Lowpass to Bandpass<br>
                Center Freq \u03c90: ${(wc / Math.PI).toFixed(2)}\u03c0 rad<br>
                Bandwidth \u0394\u03c9: ${(dw / Math.PI).toFixed(2)}\u03c0 rad<br>
                Parameters: \u03b1 = ${alpha.toFixed(2)}, \u03b2 = ${beta.toFixed(2)}
            `;
        } else {
            valMetrics.innerHTML = `
                Type: Lowpass to ${type === "lowpass" ? "Lowpass" : "Highpass"}<br>
                Target Cutoff \u03c9c: ${(wc / Math.PI).toFixed(2)}\u03c0 rad<br>
                Prototype Cutoff \u03b8c: ${(theta_c / Math.PI).toFixed(2)}\u03c0 rad<br>
                Parameter \u03b1: ${alpha.toFixed(2)}
            `;
        }
    }

    selectType.addEventListener("change", draw);
    sliderWc.addEventListener("input", draw);
    sliderDw.addEventListener("input", draw);

    selectType.addEventListener("change", draw);
    sliderWc.addEventListener("input", draw);
    sliderDw.addEventListener("input", draw);

    draw();
}

// ============================================================================
// 37. Adaptive Noise Cancellation Simulator (Lecture 30)
// ============================================================================
function initAdaptiveNoiseCancellationSimulator() {
    const selectSignal = document.getElementById("select-l30-signal");
    const sliderMu = document.getElementById("slider-l30-mu");
    const sliderG = document.getElementById("slider-l30-g");

    const valMu = document.getElementById("val-l30-mu");
    const valG = document.getElementById("val-l30-g");
    const valMetrics = document.getElementById("val-l30-metrics");

    const canvasTime = document.getElementById("canvas-l30-time");
    const canvasError = document.getElementById("canvas-l30-error");

    if (!selectSignal || !sliderMu || !sliderG || !canvasTime || !canvasError) return;

    const ctxTime = canvasTime.getContext("2d");
    const ctxError = canvasError.getContext("2d");

    function resize() {
        const w = canvasTime.parentElement.clientWidth * window.devicePixelRatio;
        const h = 230 * window.devicePixelRatio;

        canvasTime.width = w;
        canvasTime.height = h;
        ctxTime.resetTransform();
        ctxTime.scale(window.devicePixelRatio, window.devicePixelRatio);

        canvasError.width = w;
        canvasError.height = h;
        ctxError.resetTransform();
        ctxError.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        const signalType = selectSignal.value;
        const mu = parseFloat(sliderMu.value);
        const g = parseFloat(sliderG.value);

        valMu.innerText = mu.toFixed(3);
        valG.innerText = g.toFixed(1);

        const N = 200;
        const s = new Array(N);     // Clean signal
        const v1 = new Array(N);    // Reference noise
        const v0 = new Array(N);    // Corrupted noise
        const d = new Array(N);     // Corrupted received signal

        // Generate deterministic pseudo-random noise sequence using LCG
        let seed = 12345;
        function random() {
            let x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }

        // 1. Generate clean signal and noise
        for (let n = 0; n < N; n++) {
            // Signal
            if (signalType === "sine") {
                s[n] = Math.sin(2 * Math.PI * 0.04 * n);
            } else if (signalType === "square") {
                s[n] = Math.sign(Math.sin(2 * Math.PI * 0.04 * n));
            } else {
                s[n] = 2 * ((0.04 * n) % 1) - 1.0;
            }

            // Reference noise (Gaussian approximation)
            v1[n] = (random() + random() + random() - 1.5) * 1.0;
        }

        // 2. Filter reference noise through channel to get v0
        // channel: v0[n] = g * (v1[n] - 0.6 * v1[n-1] + 0.3 * v1[n-2])
        for (let n = 0; n < N; n++) {
            const v1_1 = n > 0 ? v1[n-1] : 0;
            const v1_2 = n > 1 ? v1[n-2] : 0;
            v0[n] = g * (v1[n] - 0.6 * v1_1 + 0.3 * v1_2);
            d[n] = s[n] + v0[n];
        }

        // 3. LMS Adaptive Filtering Loop
        const w_tap = [0, 0, 0, 0]; // 4-tap FIR filter weights
        const y = new Array(N).fill(0);
        const e = new Array(N).fill(0);
        const mse = new Array(N).fill(0);
        const smooth_mse = new Array(N).fill(0);

        let active_mse = 0;
        for (let n = 0; n < N; n++) {
            // Filter input buffer (delay line)
            const x_reg = [
                v1[n],
                n > 0 ? v1[n-1] : 0,
                n > 1 ? v1[n-2] : 0,
                n > 2 ? v1[n-3] : 0
            ];

            // Compute filter output y[n]
            let y_n = 0;
            for (let k = 0; k < 4; k++) {
                y_n += w_tap[k] * x_reg[k];
            }
            y[n] = y_n;

            // Error output e[n] (this is the recovered clean signal)
            e[n] = d[n] - y_n;

            // Actual noise estimation error squared
            const noise_err = v0[n] - y_n;
            const err_sq = noise_err * noise_err;
            mse[n] = err_sq;

            if (n === 0) {
                active_mse = err_sq;
            } else {
                active_mse = 0.92 * active_mse + 0.08 * err_sq;
            }
            smooth_mse[n] = active_mse;

            // Update filter taps via LMS
            for (let k = 0; k < 4; k++) {
                w_tap[k] += 2 * mu * e[n] * x_reg[k];
            }
        }

        // Draw plots
        drawTime(s, d, e);
        drawConvergence(smooth_mse);

        // Update dashboard details
        const finalMSE = smooth_mse[N-1];
        const dbNoiseRed = 10 * Math.log10(finalMSE + 1e-6);
        valMetrics.innerHTML = `
            Tap Weights: [${w_tap.map(v => v.toFixed(2)).join(", ")}]<br>
            Learning Rate \u03bc: ${mu.toFixed(3)}<br>
            Steady-state MSE: ${finalMSE.toFixed(4)} (${dbNoiseRed.toFixed(1)} dB)
        `;
    }

    function drawTime(s, d, e) {
        const w = canvasTime.width / window.devicePixelRatio;
        const h = canvasTime.height / window.devicePixelRatio;
        ctxTime.clearRect(0, 0, w, h);

        const padX = 40;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Grid lines (amplitude -3.0 to +3.0)
        ctxTime.strokeStyle = "rgba(255,255,255,0.06)";
        ctxTime.lineWidth = 1;
        for (let i = 0; i <= 6; i++) {
            const y = padY + (i / 6) * plotH;
            ctxTime.beginPath();
            ctxTime.moveTo(padX, y);
            ctxTime.lineTo(w - padX, y);
            ctxTime.stroke();

            // Label
            ctxTime.fillStyle = "rgba(255,255,255,0.4)";
            ctxTime.font = "8px monospace";
            ctxTime.textAlign = "right";
            const val = 3.0 - i * 1.0;
            ctxTime.fillText(val.toFixed(1), padX - 5, y + 3);
        }

        // Plot corrupted signal (d[n]) - light red
        ctxTime.strokeStyle = "rgba(239, 68, 68, 0.4)";
        ctxTime.lineWidth = 1;
        ctxTime.beginPath();
        for (let n = 0; n < s.length; n++) {
            const px = padX + (n / (s.length - 1)) * plotW;
            const py = padY + (0.5 - d[n] / 6.0) * plotH;
            if (n === 0) ctxTime.moveTo(px, py);
            else ctxTime.lineTo(px, py);
        }
        ctxTime.stroke();

        // Plot clean reference signal (s[n]) - dashed blue
        ctxTime.strokeStyle = "rgba(59, 130, 246, 0.7)";
        ctxTime.lineWidth = 1.5;
        ctxTime.setLineDash([4, 3]);
        ctxTime.beginPath();
        for (let n = 0; n < s.length; n++) {
            const px = padX + (n / (s.length - 1)) * plotW;
            const py = padY + (0.5 - s[n] / 6.0) * plotH;
            if (n === 0) ctxTime.moveTo(px, py);
            else ctxTime.lineTo(px, py);
        }
        ctxTime.stroke();
        ctxTime.setLineDash([]);

        // Plot recovered signal (e[n]) - solid green
        ctxTime.strokeStyle = "#10b981";
        ctxTime.lineWidth = 1.8;
        ctxTime.beginPath();
        for (let n = 0; n < s.length; n++) {
            const px = padX + (n / (s.length - 1)) * plotW;
            const py = padY + (0.5 - e[n] / 6.0) * plotH;
            if (n === 0) ctxTime.moveTo(px, py);
            else ctxTime.lineTo(px, py);
        }
        ctxTime.stroke();

        // Axes label
        ctxTime.fillStyle = "rgba(255,255,255,0.4)";
        ctxTime.font = "8px sans-serif";
        ctxTime.textAlign = "right";
        ctxTime.fillText("Sample (n)", w - 5, padY + plotH + 13);
        ctxTime.fillText("Amplitude", padX - 5, padY - 6);
    }

    function drawConvergence(smooth_mse) {
        const w = canvasError.width / window.devicePixelRatio;
        const h = canvasError.height / window.devicePixelRatio;
        ctxError.clearRect(0, 0, w, h);

        const padX = 40;
        const padY = 20;
        const plotW = w - 2 * padX;
        const plotH = h - 2 * padY;

        // Grid lines (MSE from 0.0 to 1.0)
        ctxError.strokeStyle = "rgba(255,255,255,0.06)";
        ctxError.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padY + (i / 5) * plotH;
            ctxError.beginPath();
            ctxError.moveTo(padX, y);
            ctxError.lineTo(w - padX, y);
            ctxError.stroke();

            // Label
            ctxError.fillStyle = "rgba(255,255,255,0.4)";
            ctxError.font = "8px monospace";
            ctxError.textAlign = "right";
            const val = 1.0 - i * 0.2;
            ctxError.fillText(val.toFixed(1), padX - 5, y + 3);
        }

        // Plot learning curve (smooth_mse) - solid purple
        ctxError.strokeStyle = "#8b5cf6";
        ctxError.lineWidth = 2.0;
        ctxError.beginPath();
        for (let n = 0; n < smooth_mse.length; n++) {
            const px = padX + (n / (smooth_mse.length - 1)) * plotW;
            const py = padY + (1.0 - Math.min(smooth_mse[n], 1.0)) * plotH;
            if (n === 0) ctxError.moveTo(px, py);
            else ctxError.lineTo(px, py);
        }
        ctxError.stroke();

        // Axes label
        ctxError.fillStyle = "rgba(255,255,255,0.4)";
        ctxError.font = "8px sans-serif";
        ctxError.textAlign = "right";
        ctxError.fillText("Sample (n)", w - 5, padY + plotH + 13);
        ctxError.fillText("MSE Value", padX - 5, padY - 6);
    }

    selectSignal.addEventListener("change", draw);
    sliderMu.addEventListener("input", draw);
    sliderG.addEventListener("input", draw);

    draw();
}

























