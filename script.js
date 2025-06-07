        // Section toggling for navbar and footer links
        function setupSectionToggling(selector) {
            document.querySelectorAll(selector).forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const sectionId = e.target.getAttribute('data-section');
                    if (sectionId) {
                        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
                        document.querySelector(`#${sectionId}`).classList.add('active');
                    }
                });
            });
        }

        setupSectionToggling('.nav-link');
        setupSectionToggling('.footer-links a');
        setupSectionToggling('.feature-card a');

        // Get Started button
        document.getElementById('get-started-btn').addEventListener('click', () => {
            document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
            document.querySelector('#image-to-pdf').classList.add('active');
        });

        // Drag and Drop
        function setupDropZone(dropZoneId, inputId, previewId, allowedTypes) {
            const dropZone = document.getElementById(dropZoneId);
            const input = document.getElementById(inputId);
            const preview = previewId ? document.getElementById(previewId) : null;

            dropZone.addEventListener('click', () => input.click());
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (preview) handleFiles(files, preview, allowedTypes);
                input.files = files; // Ensure input reflects dropped files
            });
            input.addEventListener('change', () => {
                if (preview) handleFiles(input.files, preview, allowedTypes);
            });
        }

        function handleFiles(files, preview, allowedTypes) {
            preview.innerHTML = '';
            Array.from(files).forEach(file => {
                if (allowedTypes.includes(file.type) || (allowedTypes.includes('application/pdf') && file.name.endsWith('.pdf'))) {
                    if (file.type.startsWith('image/')) {
                        const img = document.createElement('img');
                        img.src = URL.createObjectURL(file);
                        preview.appendChild(img);
                    } else if (file.name.endsWith('.pdf')) {
                        const span = document.createElement('span');
                        span.textContent = file.name;
                        preview.appendChild(span);
                    }
                }
            });
        }

        // Setup drag and drop for each section
        setupDropZone('drop-zone-image', 'image-input', 'image-preview', ['image/jpeg', 'image/png']);
        setupDropZone('drop-zone-compress-image', 'compress-image-input', 'compress-image-preview', ['image/jpeg', 'image/png']);
        setupDropZone('drop-zone-compress-pdf', 'compress-pdf-input', 'compress-pdf-preview', ['application/pdf']);
        setupDropZone('drop-zone-pdf-to-image', 'pdf-to-image-input', 'pdf-to-image-preview', ['application/pdf']);
        setupDropZone('drop-zone-merge-pdf', 'merge-pdf-input', 'merge-pdf-preview', ['application/pdf']);
        setupDropZone('drop-zone-watermark-pdf', 'watermark-pdf-input', null, ['application/pdf']);
        setupDropZone('drop-zone-extract-text', 'extract-text-input', null, ['application/pdf']);
        setupDropZone('drop-zone-split-pdf', 'split-pdf-input', 'split-pdf-preview', ['application/pdf']);
        setupDropZone('drop-zone-rotate-pdf', 'rotate-pdf-input', 'rotate-pdf-preview', ['application/pdf']);
        setupDropZone('drop-zone-protect-pdf', 'protect-pdf-input', 'protect-pdf-preview', ['application/pdf']);
        setupDropZone('drop-zone-image-format', 'image-format-input', 'image-format-preview', ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff']);

        // Progress simulation
        function simulateProgress(progressId, callback) {
            const progress = document.getElementById(progressId);
            const progressBar = progress.querySelector('.progress-bar');
            progress.style.display = 'block';
            let width = 0;
            const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                    progress.style.display = 'none';
                    progressBar.style.width = '0%';
                    callback();
                } else {
                    width += 10;
                    progressBar.style.width = width + '%';
                }
            }, 200);
        }

        // Image to PDF
        document.getElementById('convert-image-to-pdf').addEventListener('click', () => {
            const images = document.querySelectorAll('#image-preview img');
            if (images.length === 0) return alert('Please upload images');
            simulateProgress('image-progress', () => {
                const element = document.createElement('div');
                images.forEach(img => {
                    const clone = img.cloneNode();
                    clone.style.maxWidth = '100%';
                    element.appendChild(clone);
                });
                html2pdf().from(element).set({ margin: 10, filename: 'converted.pdf' }).save();
            });
        });

        // Text to PDF
        document.getElementById('convert-text-to-pdf').addEventListener('click', () => {
            const text = document.getElementById('text-input').value;
            if (!text) return alert('Please enter text');
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFontSize(12);
            doc.text(text.split('\n'), 10, 10);
            doc.save('text.pdf');
        });

        // PDF to Image
        document.getElementById('convert-pdf-to-image').addEventListener('click', async () => {
            try {
                const input = document.getElementById('pdf-to-image-input');
                if (input.files.length === 0) return alert('Please upload a PDF');
                simulateProgress('pdf-to-image-progress', async () => {
                    const file = input.files[0];
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 1.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;
                    const imgData = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.href = imgData;
                    link.download = 'converted-image.png';
                    link.click();
                });
            } catch (err) {
                alert('Error converting PDF to image: ' + err.message);
            }
        });

        // Merge PDFs
        document.getElementById('merge-pdf-btn').addEventListener('click', async () => {
            try {
                const input = document.getElementById('merge-pdf-input');
                if (input.files.length < 2) return alert('Please upload at least two PDFs');
                simulateProgress('merge-pdf-progress', async () => {
                    const mergedPdf = await PDFLib.PDFDocument.create();
                    for (const file of input.files) {
                        const arrayBuffer = await file.arrayBuffer();
                        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
                        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                        copiedPages.forEach(page => mergedPdf.addPage(page));
                    }
                    const pdfBytes = await mergedPdf.save();
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    saveAs(blob, 'merged.pdf');
                });
            } catch (err) {
                alert('Error merging PDFs: ' + err.message);
            }
        });

        // Compress Image
        document.getElementById('compress-image-btn').addEventListener('click', () => {
            const input = document.getElementById('compress-image-input');
            if (input.files.length === 0) return alert('Please upload an image');
            simulateProgress('compress-image-progress', () => {
                new Compressor(input.files[0], {
                    quality: 0.6,
                    success(result) {
                        saveAs(result, 'compressed-image.jpg');
                    },
                    error(err) {
                        alert('Compression failed: ' + err.message);
                    }
                });
            });
        });

        // Compress PDF
        document.getElementById('compress-pdf-btn').addEventListener('click', async () => {
            try {
                const input = document.getElementById('compress-pdf-input');
                if (input.files.length === 0) return alert('Please upload a PDF');
                simulateProgress('compress-pdf-progress', async () => {
                    const file = input.files[0];
                    const arrayBuffer = await file.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                    const compressedPdf = await PDFLib.PDFDocument.create();
                    const pageIndices = pdfDoc.getPageIndices();
                    for (const idx of pageIndices) {
                        const [copiedPage] = await compressedPdf.copyPages(pdfDoc, [idx]);
                        compressedPdf.addPage(copiedPage);
                    }
                    const pdfBytes = await compressedPdf.save({ useObjectStreams: false });
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    saveAs(blob, 'compressed.pdf');
                });
            } catch (err) {
                alert('Error compressing PDF: ' + err.message);
            }
        });

        // Add Watermark
        document.getElementById('add-watermark-btn').addEventListener('click', async () => {
            try {
                const input = document.getElementById('watermark-pdf-input');
                const watermarkText = document.getElementById('watermark-text').value;
                const style = document.getElementById('watermark-style').value;
                if (input.files.length === 0 || !watermarkText) return alert('Please upload a PDF and enter watermark text');
                simulateProgress('watermark-progress', async () => {
                    const file = input.files[0];
                    const arrayBuffer = await file.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
                    const pages = pdfDoc.getPages();
                    pages.forEach(page => {
                        const { width, height } = page.getSize();
                        page.drawText(watermarkText, {
                            x: width / 4,
                            y: height / 2,
                            size: style === 'fancy' ? 50 : style === 'elegant' ? 30 : 40,
                            font: font,
                            color: PDFLib.rgb(0.5, 0.5, 0.5),
                            opacity: 0.3,
                            rotate: PDFLib.degrees(45),
                        });
                    });
                    const pdfBytes = await pdfDoc.save();
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    saveAs(blob, 'watermarked.pdf');
                });
            } catch (err) {
                alert('Error adding watermark: ' + err.message);
            }
        });

        // Extract Text from PDF
        document.getElementById('extract-text-btn').addEventListener('click', async () => {
            try {
                const input = document.getElementById('extract-text-input');
                const output = document.getElementById('extracted-text');
                if (input.files.length === 0) return alert('Please upload a PDF');
                simulateProgress('extract-text-progress', async () => {
                    const file = input.files[0];
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                    let text = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        text += content.items.map(item => item.str).join(' ') + '\n';
                    }
                    output.value = text || 'No text found in the PDF';
                });
            } catch (err) {
                alert('Error extracting text: ' + err.message);
            }
        });

        // Split PDF
        document.getElementById('split-pdf-btn').addEventListener('click', async () => {
            try {
                const input = document.getElementById('split-pdf-input');
                if (input.files.length === 0) return alert('Please upload a PDF');
                simulateProgress('split-pdf-progress', async () => {
                    const file = input.files[0];
                    const arrayBuffer = await file.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                    const pageIndices = pdfDoc.getPageIndices();
                    for (const idx of pageIndices) {
                        const newPdf = await PDFLib.PDFDocument.create();
                        const [copiedPage] = await newPdf.copyPages(pdfDoc, [idx]);
                        newPdf.addPage(copiedPage);
                        const pdfBytes = await newPdf.save();
                        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                        saveAs(blob, `page-${idx + 1}.pdf`);
                    }
                });
            } catch (err) {
                alert('Error splitting PDF: ' + err.message);
            }
        });

        // Rotate PDF
        document.getElementById('rotate-pdf-btn').addEventListener('click', async () => {
            try {
                const input = document.getElementById('rotate-pdf-input');
                const degree = parseInt(document.getElementById('rotate-degree').value);
                if (input.files.length === 0) return alert('Please upload a PDF');
                simulateProgress('rotate-pdf-progress', async () => {
                    const file = input.files[0];
                    const arrayBuffer = await file.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                    const pages = pdfDoc.getPages();
                    pages.forEach(page => {
                        const rotation = (page.getRotation().angle + degree) % 360;
                        page.setRotation({ angle: rotation });
                    });
                    const pdfBytes = await pdfDoc.save();
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    saveAs(blob, 'rotated.pdf');
                });
            } catch (err) {
                alert('Error rotating PDF: ' + err.message);
            }
        });

        // Protect PDF
        document.getElementById('protect-pdf-btn').addEventListener('click', async () => {
            try {
                const input = document.getElementById('protect-pdf-input');
                const password = document.getElementById('pdf-password').value;
                if (input.files.length === 0) return alert('Please upload a PDF');
                if (!password) return alert('Please enter a password');
                simulateProgress('protect-pdf-progress', async () => {
                    const file = input.files[0];
                    const arrayBuffer = await file.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                    pdfDoc.encrypt({
                        userPassword: password,
                        ownerPassword: password,
                        permissions: {
                            printing: 'highResolution',
                            modifying: false,
                            copying: false,
                        },
                    });
                    const pdfBytes = await pdfDoc.save();
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    saveAs(blob, 'protected.pdf');
                });
            } catch (err) {
                alert('Error protecting PDF: ' + err.message);
            }
        });

        // Image Format Converter
        document.getElementById('convert-image-format-btn').addEventListener('click', () => {
            try {
                const input = document.getElementById('image-format-input');
                const format = document.getElementById('image-format-type').value;
                if (input.files.length === 0) return alert('Please upload an image');
                simulateProgress('image-format-progress', () => {
                    const file = input.files[0];
                    const img = new Image();
                    img.src = URL.createObjectURL(file);
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        let mimeType, quality, extension;
                        // Test if WEBP is supported
                        const webpSupported = canvas.toDataURL('image/webp').startsWith('data:image/webp');
                        switch (format) {
                            case 'jpeg':
                                mimeType = 'image/jpeg';
                                quality = 0.9;
                                extension = 'jpeg';
                                break;
                            case 'png':
                                mimeType = 'image/png';
                                quality = 1;
                                extension = 'png';
                                break;
                            case 'webp':
                                if (!webpSupported) {
                                    alert('WEBP format is not supported by your browser. Converting to PNG instead.');
                                    mimeType = 'image/png';
                                    quality = 1;
                                    extension = 'png';
                                } else {
                                    mimeType = 'image/webp';
                                    quality = 0.9;
                                    extension = 'webp';
                                }
                                break;
                            case 'gif':
                            case 'bmp':
                            case 'tiff':
                                mimeType = 'image/png'; // Fallback to PNG
                                quality = 1;
                                extension = 'png';
                                break;
                            default:
                                mimeType = 'image/png';
                                quality = 1;
                                extension = 'png';
                        }
                        const dataUrl = canvas.toDataURL(mimeType, quality);
                        const link = document.createElement('a');
                        link.href = dataUrl;
                        link.download = `converted-image.${extension}`;
                        link.click();
                    };
                });
            } catch (err) {
                alert('Error converting image format: ' + err.message);
            }
        });

        // Contact Us Form Submission (Placeholder)
        document.getElementById('contact-submit').addEventListener('click', () => {
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;
            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }
            alert(`Thank you, ${name}! Your message has been received. We'll get back to you at ${email} soon.`);
            document.getElementById('contact-name').value = '';
            document.getElementById('contact-email').value = '';
            document.getElementById('contact-message').value = '';
        });

        // Clear buttons
        document.querySelectorAll('.btn-secondary[id^="clear-"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.id.replace('clear-', '');
                const input = document.getElementById(`${section}-input`);
                const preview = document.getElementById(`${section}-preview`);
                const textInput = document.getElementById(`${section === 'text' ? 'text-input' : section === 'extract-text' ? 'extracted-text' : ''}`);
                const watermarkText = document.getElementById('watermark-text');
                const pdfPassword = document.getElementById('pdf-password');
                const contactName = document.getElementById('contact-name');
                const contactEmail = document.getElementById('contact-email');
                const contactMessage = document.getElementById('contact-message');

                // Clear file inputs
                if (input) input.value = '';

                // Clear previews
                if (preview) preview.innerHTML = '';

                // Clear textareas
                if (textInput) textInput.value = '';

                // Clear specific fields
                if (section === 'watermark' && watermarkText) watermarkText.value = '';
                if (section === 'protect-pdf' && pdfPassword) pdfPassword.value = '';
                if (section === 'contact') {
                    if (contactName) contactName.value = '';
                    if (contactEmail) contactEmail.value = '';
                    if (contactMessage) contactMessage.value = '';
                }
            });
        });

        document.getElementById('newsletter-subscribe').addEventListener('click', () => {
            const email = document.getElementById('newsletter-email').value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            alert('Thank you for subscribing!');
            document.getElementById('newsletter-email').value = '';
        });

        // Show landing page by default
        document.getElementById('landing-page').classList.add('active');
    