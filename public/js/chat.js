// Enhanced Chat functionality with file upload and screenshot support

class ChatInterface {
    constructor() {
        this.conversationHistory = [];
        this.currentModel = this.getCurrentModel();
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.supportedFileTypes = [];
        this.isUploading = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadModelCapabilities();
        this.setupPasteHandler();
    }

    getCurrentModel() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    }

    initializeElements() {
        this.chatContainer = document.getElementById('chatMessages') || document.getElementById('chat-container');
        this.messageInput = document.getElementById('messageInput') || document.getElementById('message-input');
        this.sendButton = document.getElementById('sendBtn') || document.getElementById('send-button');
        this.fileInput = document.getElementById('fileInput') || document.getElementById('file-input');
        this.fileButton = document.getElementById('attachBtn') || document.getElementById('file-button');
        this.screenshotButton = document.getElementById('screenshotBtn') || document.getElementById('screenshot-button');
        this.filePreview = document.getElementById('file-preview');
        this.clearFileButton = document.getElementById('clear-file');
    }

    attachEventListeners() {
        // Send message events
        this.sendButton?.addEventListener('click', () => this.sendMessage());
        this.messageInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // File upload events
        this.fileButton?.addEventListener('click', () => this.fileInput?.click());
        this.fileInput?.addEventListener('change', (e) => this.handleFileSelection(e));
        this.clearFileButton?.addEventListener('click', () => this.clearFileSelection());

        // Screenshot events
        this.screenshotButton?.addEventListener('click', () => this.captureScreenshot());

        // Auto-resize textarea
        this.messageInput?.addEventListener('input', () => this.autoResizeTextarea());

        // Drag and drop
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const dropZones = [this.messageInput, this.chatContainer].filter(Boolean);
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                this.handleDroppedFiles(e.dataTransfer.files);
            });
        });
    }

    setupPasteHandler() {
        // Handle paste events for screenshots
        document.addEventListener('paste', (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    this.handlePastedImage(file);
                    break;
                }
            }
        });
    }

    async loadModelCapabilities() {
        try {
            const response = await fetch(`/api/models/${this.currentModel}/file-types`);
            if (response.ok) {
                const data = await response.json();
                this.supportedFileTypes = data.supportedTypes;
                this.updateFileUploadUI();
            }
        } catch (error) {
            console.error('Failed to load model capabilities:', error);
            // Set default capabilities
            this.supportedFileTypes = {
                images: ['.jpg', '.jpeg', '.png', '.gif'],
                texts: ['.txt', '.md', '.json'],
                maxSize: '10MB'
            };
            this.updateFileUploadUI();
        }
    }

    updateFileUploadUI() {
        const hasFileSupport = this.supportedFileTypes.images?.length > 0 || 
                              this.supportedFileTypes.texts?.length > 0;
        
        // Add file upload controls if they don't exist
        if (hasFileSupport && !this.fileButton) {
            this.createFileUploadControls();
        }
        
        if (this.fileButton) {
            this.fileButton.style.display = hasFileSupport ? 'inline-block' : 'none';
        }
        
        if (this.screenshotButton) {
            this.screenshotButton.style.display = 
                this.supportedFileTypes.images?.length > 0 ? 'inline-block' : 'none';
        }
    }

    createFileUploadControls() {
        // Create file input if it doesn't exist
        if (!this.fileInput) {
            this.fileInput = document.createElement('input');
            this.fileInput.type = 'file';
            this.fileInput.id = 'fileInput';
            this.fileInput.style.display = 'none';
            this.fileInput.accept = this.getAcceptedFileTypes();
            document.body.appendChild(this.fileInput);
            this.fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        }

        // Add file upload buttons to the input area
        const inputContainer = this.messageInput?.parentElement;
        if (inputContainer && !this.fileButton) {
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'file-controls';
            controlsDiv.innerHTML = `
                <button type="button" id="attachBtn" class="file-btn" title="Upload file">
                    <i class="fas fa-paperclip"></i>
                </button>
                <button type="button" id="screenshotBtn" class="file-btn" title="Take screenshot">
                    <i class="fas fa-camera"></i>
                </button>
            `;
            
            inputContainer.appendChild(controlsDiv);
            
            this.fileButton = document.getElementById('attachBtn');
            this.screenshotButton = document.getElementById('screenshotBtn');
            
            this.fileButton.addEventListener('click', () => this.fileInput?.click());
            this.screenshotButton.addEventListener('click', () => this.captureScreenshot());
        }

        // Create file preview area
        if (!this.filePreview) {
            this.filePreview = document.createElement('div');
            this.filePreview.id = 'file-preview';
            this.filePreview.className = 'file-preview';
            this.filePreview.style.display = 'none';
            
            const inputContainer = this.messageInput?.parentElement;
            if (inputContainer) {
                inputContainer.insertBefore(this.filePreview, this.messageInput);
            }
        }
    }

    getAcceptedFileTypes() {
        const imageTypes = this.supportedFileTypes.images?.join(',') || '';
        const textTypes = this.supportedFileTypes.texts?.join(',') || '';
        return [imageTypes, textTypes].filter(Boolean).join(',');
    }

    handleFileSelection(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!this.validateFile(file)) {
            this.clearFileSelection();
            return;
        }

        this.displayFilePreview(file);
    }

    handleDroppedFiles(files) {
        if (files.length === 0) return;
        
        const file = files[0]; // Only handle first file
        if (!this.validateFile(file)) return;
        
        this.displayFilePreview(file);
    }

    handlePastedImage(file) {
        if (!this.validateFile(file)) return;
        this.displayFilePreview(file, true);
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            this.showError(`File size exceeds ${this.formatFileSize(this.maxFileSize)} limit`);
            return false;
        }

        // Check file type
        const isImage = file.type.startsWith('image/');
        const isText = file.type.startsWith('text/') || 
                      ['application/json', 'text/plain'].includes(file.type);

        const supportsImages = this.supportedFileTypes.images?.length > 0;
        const supportsTexts = this.supportedFileTypes.texts?.length > 0;

        if (isImage && !supportsImages) {
            this.showError('This model does not support image files');
            return false;
        }

        if (isText && !supportsTexts) {
            this.showError('This model does not support text files');
            return false;
        }

        if (!isImage && !isText) {
            this.showError('Unsupported file type');
            return false;
        }

        return true;
    }

    displayFilePreview(file, isPasted = false) {
        if (!this.filePreview) return;

        const fileName = isPasted ? 'Pasted Image' : file.name;
        const fileSize = this.formatFileSize(file.size);
        const fileType = file.type.startsWith('image/') ? 'Image' : 'Text';

        this.filePreview.innerHTML = `
            <div class="file-preview-content">
                <div class="file-info">
                    <i class="fas ${file.type.startsWith('image/') ? 'fa-image' : 'fa-file-text'}"></i>
                    <div class="file-details">
                        <div class="file-name">${fileName}</div>
                        <div class="file-meta">${fileType} • ${fileSize}</div>
                    </div>
                </div>
                <button type="button" class="clear-file-btn" onclick="chatInterface.clearFileSelection()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        this.filePreview.style.display = 'block';
        this.selectedFile = file;
        this.isPastedFile = isPasted;
    }

    clearFileSelection() {
        if (this.filePreview) {
            this.filePreview.style.display = 'none';
            this.filePreview.innerHTML = '';
        }
        if (this.fileInput) {
            this.fileInput.value = '';
        }
        this.selectedFile = null;
        this.isPastedFile = false;
    }

    async captureScreenshot() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                this.showError('Screen capture is not supported in this browser');
                return;
            }

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'screen' }
            });

            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            video.addEventListener('loadedmetadata', () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);
                
                // Stop the stream
                stream.getTracks().forEach(track => track.stop());
                
                // Convert to blob and handle as pasted image
                canvas.toBlob((blob) => {
                    const file = new File([blob], 'screenshot.png', { type: 'image/png' });
                    this.handlePastedImage(file);
                });
            });

        } catch (error) {
            console.error('Screenshot capture failed:', error);
            this.showError('Failed to capture screenshot');
        }
    }

    async sendMessage() {
        const message = this.messageInput?.value.trim();
        if (!message && !this.selectedFile) return;
        if (this.isUploading) return;

        try {
            this.isUploading = true;
            this.updateSendButton(true);

            // Add user message to chat
            if (message) {
                this.addMessageToChat('user', message);
            }

            // Handle file upload with message
            if (this.selectedFile) {
                await this.sendMessageWithFile(message || '');
            } else {
                await this.sendTextMessage(message);
            }

            // Clear input and file
            if (this.messageInput) this.messageInput.value = '';
            this.clearFileSelection();
            this.autoResizeTextarea();

        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Failed to send message. Please try again.');
        } finally {
            this.isUploading = false;
            this.updateSendButton(false);
        }
    }

    async sendTextMessage(message) {
        const response = await fetch(`/chat/${this.currentModel}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                conversationHistory: this.conversationHistory.slice(-10)
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
            const responseContent = data.response.content || data.response.message || data.response;
            this.addMessageToChat('assistant', responseContent);
            this.updateConversationHistory(message, responseContent);
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    }

    async sendMessageWithFile(message) {
        if (this.isPastedFile) {
            // Handle pasted/screenshot images via base64
            await this.sendScreenshot(message);
        } else {
            // Handle regular file uploads
            await this.sendFileUpload(message);
        }
    }

    async sendFileUpload(message) {
        const formData = new FormData();
        formData.append('message', message);
        formData.append('file', this.selectedFile);
        formData.append('conversationHistory', JSON.stringify(this.conversationHistory.slice(-10)));

        const response = await fetch(`/chat/${this.currentModel}/send`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
            const responseContent = data.response.content || data.response.message || data.response;
            this.addMessageToChat('assistant', responseContent);
            this.updateConversationHistory(message, responseContent);
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    }

    async sendScreenshot(message) {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(this.selectedFile);
        });

        const base64Data = await base64Promise;

        const response = await fetch(`/chat/${this.currentModel}/screenshot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageData: base64Data,
                message
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
            const responseContent = data.response.content || data.response.message || data.response;
            this.addMessageToChat('assistant', responseContent);
            this.updateConversationHistory(message, responseContent);
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    }

    addMessageToChat(sender, content) {
        if (!this.chatContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-robot"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = this.formatMessage(content);
        
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(timestamp);
        
        this.chatContainer.appendChild(messageDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    formatMessage(content) {
        if (typeof content === 'object' && content.imageUrl) {
            return `
                <div class="generated-image">
                    <img src="${content.imageUrl}" alt="Generated image" style="max-width: 100%; border-radius: 8px;">
                    <p>${content.prompt}</p>
                </div>
            `;
        }
        
        // Format text content (basic markdown-like formatting)
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    updateConversationHistory(userMessage, assistantMessage) {
        this.conversationHistory.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: assistantMessage }
        );
        
        // Keep only last 20 messages for context
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
    }

    updateSendButton(isLoading) {
        if (!this.sendButton) return;
        
        if (isLoading) {
            this.sendButton.disabled = true;
            this.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            this.sendButton.disabled = false;
            this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }

    autoResizeTextarea() {
        if (!this.messageInput) return;
        
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(message) {
        // Create or update error notification
        let errorDiv = document.getElementById('error-notification');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-notification';
            errorDiv.className = 'error-notification';
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4444;
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                max-width: 300px;
                font-size: 14px;
                animation: slideInRight 0.3s ease-out;
            `;
            document.body.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        document.body.removeChild(errorDiv);
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Add necessary CSS
const styles = `
    .file-controls {
        display: flex;
        gap: 5px;
        margin: 5px 0;
    }
    
    .file-btn {
        background: var(--accent-color, #007bff);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 10px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
    }
    
    .file-btn:hover {
        background: var(--accent-hover, #0056b3);
        transform: translateY(-1px);
    }
    
    .file-preview {
        margin: 10px 0;
        padding: 10px;
        background: var(--card-bg, #f8f9fa);
        border-radius: 8px;
        border: 1px solid var(--border-color, #ddd);
    }
    
    .file-preview-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .file-info {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .file-info i {
        color: var(--accent-color, #007bff);
        font-size: 18px;
    }
    
    .file-name {
        font-weight: 500;
        font-size: 14px;
    }
    
    .file-meta {
        font-size: 12px;
        color: var(--text-secondary, #666);
    }
    
    .clear-file-btn {
        background: none;
        border: none;
        color: var(--text-secondary, #666);
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
        transition: all 0.2s ease;
    }
    
    .clear-file-btn:hover {
        background: var(--error-color, #ff4444);
        color: white;
    }
    
    .drag-over {
        border: 2px dashed var(--accent-color, #007bff) !important;
        background-color: var(--accent-bg, rgba(0, 123, 255, 0.1)) !important;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialize chat interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatInterface = new ChatInterface();
});
