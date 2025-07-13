// DOM Elements
const fileTypeSelect = document.getElementById('fileType');
const startNumberInput = document.getElementById('startNumber');
const fileCountInput = document.getElementById('fileCount');
const zipDownloadCheckbox = document.getElementById('zipDownload');
const generateBtn = document.getElementById('generateBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const downloadConfirmation = document.getElementById('downloadConfirmation');
const downloadBtn = document.getElementById('downloadBtn');
const deleteBtn = document.getElementById('deleteBtn');
const fileSizeInfo = document.getElementById('fileSizeInfo');
const downloadSize = document.getElementById('downloadSize');

// File Converter Elements
const fileUpload = document.getElementById('fileUpload');
const browseBtn = document.getElementById('browseBtn');
const dropArea = document.getElementById('dropArea');
const fileList = document.getElementById('fileList');
const convertToSelect = document.getElementById('convertTo');
const convertZipDownloadCheckbox = document.getElementById('convertZipDownload');
const convertBtn = document.getElementById('convertBtn');
const convertProgressContainer = document.getElementById('convertProgressContainer');
const convertProgressBar = document.getElementById('convertProgressBar');
const convertProgressText = document.getElementById('convertProgressText');
const convertedDownloadConfirmation = document.getElementById('convertedDownloadConfirmation');
const convertedDownloadBtn = document.getElementById('convertedDownloadBtn');
const convertedDeleteBtn = document.getElementById('convertedDeleteBtn');
const convertedFileSizeInfo = document.getElementById('convertedFileSizeInfo');
const convertedDownloadSize = document.getElementById('convertedDownloadSize');

// Variables
let generatedContent = null;
let generatedFileName = '';
let generatedFileSize = 0;
let isGenerating = false;
let generatedFiles = [];
let convertedContent = null;
let convertedFileName = '';
let convertedFileSize = 0;
let isConverting = false;
let convertedFiles = [];
let uploadedFiles = [];
let draggedItem = null;

// Constants
const FILE_EXTENSIONS = {
    folder: '',
    md: '.md',
    txt: '.txt',
    c: '.c',
    cpp: '.cpp'
};
const MAX_FILES_WITHOUT_ZIP = 10; 

// Initialize
function init() {
    if (!fileTypeSelect || !startNumberInput || !fileCountInput || !generateBtn) {
        console.error("Essential generator elements missing");
        return;
    }

    // Generator events
    generateBtn.addEventListener('click', generateFiles);
    fileTypeSelect.addEventListener('change', handleFileTypeChange);
    zipDownloadCheckbox.addEventListener('change', validateOptions);
    downloadBtn.addEventListener('click', handleDownload);
    deleteBtn.addEventListener('click', handleDelete);

    // Converter events
    if (fileUpload && browseBtn && dropArea) {
        browseBtn.addEventListener('click', () => fileUpload.click());
        fileUpload.addEventListener('change', handleFileUpload);
        dropArea.addEventListener('click', () => fileUpload.click());
        dropArea.addEventListener('dragover', handleDragOver);
        dropArea.addEventListener('dragleave', handleDragLeave);
        dropArea.addEventListener('drop', handleDrop);
        convertBtn.addEventListener('click', convertFiles);
        convertedDownloadBtn.addEventListener('click', handleConvertedDownload);
        convertedDeleteBtn.addEventListener('click', handleConvertedDelete);
    }

    // UI Initialization
    hideDownloadConfirmation();
    resetProgress();
    resetConvertedUI();
    updateFileList();
}

// File Upload Functions
function handleFileUpload() {
    if (fileUpload.files.length > 0) {
        const files = Array.from(fileUpload.files);
        addFiles(files); 
        fileUpload.value = '';
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (dropArea) dropArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    if (dropArea) dropArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    if (dropArea) dropArea.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        addFiles(files); 
    }
}

function addFiles(newFiles) {
    uploadedFiles.push(...newFiles);
    updateFileList();
    enableConvertButton();
}

function enableConvertButton() {
    if (convertBtn) convertBtn.disabled = uploadedFiles.length === 0;
}

// File List Management
function updateFileList() {
    if (!fileList) return;
    
    fileList.innerHTML = '';
    
    if (uploadedFiles.length === 0) {
        fileList.innerHTML = '<p class="text-gray-500 text-sm">No files uploaded</p>';
        enableConvertButton();
        return;
    }
    
    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item flex items-center justify-between p-2 border border-gray-200 rounded-md';
        fileItem.draggable = true;
        fileItem.dataset.index = index;
        
        fileItem.innerHTML = `
            <div class="flex items-center">
                <span class="text-gray-700 mr-2">${index + 1}.</span>
                <span class="file-name text-gray-800 truncate">${file.name}</span>
                <span class="text-gray-500 text-xs ml-2">(${(file.size / 1024).toFixed(2)} KB)</span>
            </div>
            <div class="flex space-x-2">
                <button class="rename-file text-blue-500 hover:text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
                <button class="delete-file text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
                <span class="drag-handle text-gray-400 hover:text-gray-600 cursor-move">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </span>
            </div>
        `;
        
        fileList.appendChild(fileItem);
        
        // Drag events
        fileItem.addEventListener('dragstart', handleDragStart);
        fileItem.addEventListener('dragover', handleItemDragOver);
        fileItem.addEventListener('dragleave', handleItemDragLeave);
        fileItem.addEventListener('drop', handleItemDrop);
        fileItem.addEventListener('dragend', handleDragEnd);
        
        // Rename button
        fileItem.querySelector('.rename-file').addEventListener('click', (e) => {
            e.stopPropagation();
            renameFile(index);
        });
        
        // Delete button
        fileItem.querySelector('.delete-file').addEventListener('click', (e) => {
            e.stopPropagation();
            uploadedFiles.splice(index, 1);
            updateFileList();
            enableConvertButton();
        });
    });
    
    // Add More Files button
    const addMoreBtn = document.createElement('button');
    addMoreBtn.className = 'w-full mt-2 bg-blue-100 text-blue-600 py-1 px-3 rounded-md hover:bg-blue-200 text-sm';
    addMoreBtn.textContent = 'Add More Files';
    addMoreBtn.addEventListener('click', () => fileUpload.click());
    fileList.appendChild(addMoreBtn);
    
    // Clear All button
    if (uploadedFiles.length > 0) {
        const clearAllBtn = document.createElement('button');
        clearAllBtn.className = 'w-full mt-2 bg-red-100 text-red-600 py-1 px-3 rounded-md hover:bg-red-200 text-sm';
        clearAllBtn.textContent = 'Clear All';
        clearAllBtn.addEventListener('click', () => {
            uploadedFiles = [];
            updateFileList();
            enableConvertButton();
        });
        fileList.appendChild(clearAllBtn);
    }
}

function renameFile(index) {
    const file = uploadedFiles[index];
    const currentName = file.name;
    const newName = prompt('Enter new file name:', currentName);
    
    if (newName && newName !== currentName) {
        const renamedFile = new File([file], newName, {
            type: file.type,
            lastModified: file.lastModified
        });
        uploadedFiles[index] = renamedFile;
        updateFileList();
    }
}

// Drag and Drop Reordering
function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleItemDragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleItemDragLeave() {
    this.classList.remove('drag-over');
}

function handleItemDrop(e) {
    e.stopPropagation();
    this.classList.remove('drag-over');
    
    if (draggedItem !== this) {
        const fromIndex = parseInt(draggedItem.dataset.index);
        const toIndex = parseInt(this.dataset.index);
        [uploadedFiles[fromIndex], uploadedFiles[toIndex]] = [uploadedFiles[toIndex], uploadedFiles[fromIndex]];
        updateFileList();
    }
}

function handleDragEnd() {
    this.classList.remove('dragging');
}

// File Generator Functions
async function generateFiles() {
    if (isGenerating) return;
    if (!validateOptions()) return;

    const fileType = fileTypeSelect.value;
    const startNumber = parseInt(startNumberInput.value) || 1;
    const fileCount = validateFileCount(parseInt(fileCountInput.value));
    const downloadAsZip = zipDownloadCheckbox.checked;

    resetUI();
    isGenerating = true;
    generateBtn.disabled = true;

    try {
        if (fileType === 'folder') {
            generatedContent = await generateEmptyFoldersZip(startNumber, fileCount);
            generatedFileName = `empty_folders_${timestamp()}.zip`;
            generatedFileSize = generatedContent.size;
        } else if (downloadAsZip || fileCount > MAX_FILES_WITHOUT_ZIP) {
            generatedContent = await generateFilesInZip(fileType, startNumber, fileCount);
            generatedFileName = `${fileType}_files_${timestamp()}.zip`;
            generatedFileSize = generatedContent.size;
        } else if (fileCount === 1) {
            const content = generateFileContent(fileType, startNumber);
            generatedContent = new Blob([content], { type: 'text/plain' });
            generatedFileName = `file_${timestamp()}${getFileExtension(fileType)}`;
            generatedFileSize = generatedContent.size;
        } else {
            generatedFiles = [];
            for (let i = 0; i < fileCount; i++) {
                const fileNumber = startNumber + i;
                const content = generateFileContent(fileType, fileNumber);
                const fileName = getFormattedFileName(fileType, fileNumber, fileCount);
                generatedFiles.push({
                    name: fileName,
                    content: new Blob([content], { type: 'text/plain' })
                });
                updateProgress(i + 1, fileCount);
                await delay(50);
            }
            generatedFileName = `${fileType}_files_${timestamp()}`;
            generatedFileSize = generatedFiles.reduce((sum, file) => sum + file.content.size, 0);
        }
        showDownloadConfirmation(generatedFileName, generatedFileSize);
    } catch (error) {
        console.error('Generation Error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        isGenerating = false;
        generateBtn.disabled = false;
    }
}

function getFormattedFileName(fileType, fileNumber, total) {
    let formattedNumber;
    
    if (total >= 100) {
        formattedNumber = fileNumber.toString().padStart(3, '0');
    } else if (total >= 10) {
        formattedNumber = fileNumber.toString().padStart(2, '0');
    } else {
        formattedNumber = fileNumber.toString();
    }
    return `No${formattedNumber}${getFileExtension(fileType)}`;
}

function handleFileTypeChange() {
    if (fileTypeSelect.value === 'folder') {
        zipDownloadCheckbox.checked = true;
        zipDownloadCheckbox.disabled = true;
    } else {
        zipDownloadCheckbox.disabled = false;
    }
    validateOptions();
}

function validateOptions() {
    const fileType = fileTypeSelect.value;
    const downloadAsZip = zipDownloadCheckbox.checked;
    
    const existingError = document.getElementById('folderError');
    if (existingError) existingError.remove();
    if (zipDownloadCheckbox) zipDownloadCheckbox.classList.remove('border-red-500');
    
    if (fileType === 'folder' && !downloadAsZip) {
        showError('Creating folders requires ZIP download option');
        return false;
    }
    return true;
}

function showError(message) {
    const errorElement = document.createElement('p');
    errorElement.id = 'folderError';
    errorElement.className = 'text-red-500 text-sm mt-1';
    errorElement.textContent = message;
    
    if (zipDownloadCheckbox && zipDownloadCheckbox.parentElement) {
        zipDownloadCheckbox.parentElement.appendChild(errorElement);
        zipDownloadCheckbox.classList.add('border-red-500');
    }
}

async function generateEmptyFoldersZip(startNumber, folderCount) {
    resetProgress();
    showProgress();

    const zip = new JSZip();
    
    for (let i = 0; i < folderCount; i++) {
        const folderNumber = startNumber + i;
        const folderName = getFormattedFileName('folder', folderNumber, folderCount);
        zip.folder(folderName);
        updateProgress(i + 1, folderCount);
        await delay(100);
    }
    
    return await zip.generateAsync(
        { type: 'blob' },
        metadata => updateProgress(metadata.currentFile, folderCount)
    );
}

async function generateFilesInZip(fileType, startNumber, fileCount) {
    resetProgress();
    showProgress();

    const zip = new JSZip();
    const folder = zip.folder(`${fileType}_files`);

    for (let i = 0; i < fileCount; i++) {
        const fileNumber = startNumber + i;
        const fileName = getFormattedFileName(fileType, fileNumber, fileCount);
        const content = generateFileContent(fileType, fileNumber);
        folder.file(fileName, content);
        updateProgress(i + 1, fileCount);
        await delay(100);
    }

    return await zip.generateAsync(
        { type: 'blob' },
        metadata => updateProgress(metadata.currentFile, fileCount)
    );
}

// File Converter Functions
async function convertFiles() {
    if (isConverting) return;
    if (uploadedFiles.length === 0) {
        alert('Please select files to convert');
        return;
    }

    if (typeof JSZip === 'undefined') {
        alert("JSZip library is not loaded. Please wait or refresh the page.");
        return;
    }

    const targetExtension = convertToSelect.value;
    const downloadAsZip = convertZipDownloadCheckbox.checked;

    resetConvertedUI();
    isConverting = true;
    if (convertBtn) convertBtn.disabled = true;
    if (convertBtn) convertBtn.textContent = 'Converting...';

    try {
        resetConvertProgress();
        showConvertProgress();

        if (downloadAsZip || uploadedFiles.length > MAX_FILES_WITHOUT_ZIP) {
            convertedContent = await convertFilesToZip(uploadedFiles, targetExtension);
            convertedFileName = `converted_files_${timestamp()}.zip`;
            convertedFileSize = convertedContent.size;
        } else if (uploadedFiles.length === 1) {
            const file = uploadedFiles[0];
            const fileName = file.name;
            const baseName = fileName.lastIndexOf('.') > 0 ? 
                fileName.substring(0, fileName.lastIndexOf('.')) : 
                fileName;
            convertedFileName = `${baseName}.${targetExtension}`;
            const fileContent = await readFileAsText(file);
            convertedContent = new Blob([fileContent], { type: 'text/plain' });
            convertedFileSize = convertedContent.size;
        } else {
            convertedFiles = [];
            for (let i = 0; i < uploadedFiles.length; i++) {
                const file = uploadedFiles[i];
                const fileName = file.name;
                const baseName = fileName.lastIndexOf('.') > 0 ? 
                    fileName.substring(0, fileName.lastIndexOf('.')) : 
                    fileName;
                const newFileName = `${baseName}.${targetExtension}`;
                const fileContent = await readFileAsText(file);
                
                convertedFiles.push({
                    name: newFileName,
                    content: new Blob([fileContent], { type: 'text/plain' })
                });
                
                updateConvertProgress(i + 1, uploadedFiles.length);
                await delay(50);
            }
            convertedFileName = `converted_files_${timestamp()}`;
            convertedFileSize = convertedFiles.reduce((sum, file) => sum + file.content.size, 0);
        }

        showConvertedDownloadConfirmation(convertedFileName, convertedFileSize);
    } catch (error) {
        console.error('Conversion Error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        isConverting = false;
        if (convertBtn) {
            convertBtn.disabled = uploadedFiles.length === 0;
            convertBtn.textContent = 'Convert Files';
        }
    }
}

async function convertFilesToZip(files, targetExtension) {
    const zip = new JSZip();
    const folder = zip.folder('converted_files');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;
        const baseName = fileName.lastIndexOf('.') > 0 ? 
            fileName.substring(0, fileName.lastIndexOf('.')) : 
            fileName;
        const newFileName = `${baseName}.${targetExtension}`;
        const fileContent = await readFileAsText(file);
        
        folder.file(newFileName, fileContent);
        updateConvertProgress(i + 1, files.length);
        await delay(50);
    }
    
    return await zip.generateAsync(
        { type: 'blob' },
        metadata => updateConvertProgress(metadata.currentFile, files.length)
    );
}

// Shared Functions
function handleDownload() {
    if (!generatedContent && generatedFiles.length === 0) return;
    
    if (generatedContent) {
        downloadFile(generatedFileName, generatedContent);
    } else {
        generatedFiles.forEach(file => {
            downloadFile(file.name, file.content);
        });
    }
    resetUI();
}

function handleDelete() {
    resetUI();
}

function handleConvertedDownload() {
    if (!convertedContent && convertedFiles.length === 0) return;
    
    if (convertedContent) {
        downloadFile(convertedFileName, convertedContent);
    } else {
        convertedFiles.forEach(file => {
            downloadFile(file.name, file.content);
        });
    }
    resetConvertedUI();
}

function handleConvertedDelete() {
    resetConvertedUI();
    uploadedFiles = [];
    updateFileList();
    enableConvertButton();
}

function downloadFile(filename, content) {
    try {
        const blob = content instanceof Blob ? content : new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Download Failed:', error);
        throw new Error(`Failed to download ${filename}`);
    }
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsText(file);
    });
}

function showDownloadConfirmation(filename, size) {
    if (!fileSizeInfo || !downloadSize || !downloadConfirmation) return;
    
    const sizeInKB = (size / 1024).toFixed(2);
    const sizeInMB = (size / (1024 * 1024)).toFixed(2);
    
    fileSizeInfo.textContent = `File: ${filename}${generatedFiles.length > 0 ? ` (${generatedFiles.length} files)` : ''}`;
    downloadSize.textContent = size > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`;
    downloadConfirmation.classList.remove('hidden');
}

function showConvertedDownloadConfirmation(filename, size) {
    if (!convertedFileSizeInfo || !convertedDownloadSize || !convertedDownloadConfirmation) return;
    
    const sizeInKB = (size / 1024).toFixed(2);
    const sizeInMB = size / (1024 * 1024) > 1 ? (size / (1024 * 1024)).toFixed(2) : null;
    
    convertedFileSizeInfo.textContent = `File: ${filename}${convertedFiles.length > 0 ? ` (${convertedFiles.length} files)` : ''}`;
    convertedDownloadSize.textContent = sizeInMB ? `${sizeInMB} MB` : `${sizeInKB} KB`;
    convertedDownloadConfirmation.classList.remove('hidden');
}

function hideDownloadConfirmation() {
    if (downloadConfirmation) downloadConfirmation.classList.add('hidden');
}

function resetUI() {
    generatedContent = null;
    generatedFileName = '';
    generatedFileSize = 0;
    generatedFiles = [];
    hideDownloadConfirmation();
    resetProgress();
}

function resetConvertedUI() {
    convertedContent = null;
    convertedFileName = '';
    convertedFileSize = 0;
    convertedFiles = [];
    if (convertedDownloadConfirmation) convertedDownloadConfirmation.classList.add('hidden');
    resetConvertProgress();
}

function generateFileContent(fileType, index) {
    const timestamp = new Date().toLocaleString();
    const baseContent = `File No${index}\nGenerated on ${timestamp}\n`;
    
    const contentTemplates = {
        folder: '',
        md: `# Markdown File No${index}\n\n${baseContent}\nThis is a sample markdown file.`,
        txt: `Text File No${index}\n\n${baseContent}\nThis is a sample text file.`,
        c: `// C Program No${index}\n// ${baseContent}\n\n#include <stdio.h>\n\nint main() {\n    printf("Hello from file No${index}!\\n");\n    return 0;\n}`,
        cpp: `// C++ Program No${index}\n// ${baseContent}\n\n#include <iostream>\n\nint main() {\n    std::cout << "Hello from file No${index}!\\n";\n    return 0;\n}`
    };
    
    return contentTemplates[fileType] || baseContent;
}

function getFileExtension(fileType) {
    return FILE_EXTENSIONS[fileType] || '';
}

function validateFileCount(count) {
    if (isNaN(count) || count < 1) return 1;
    if (count > 100) return 100;
    return count;
}

function updateProgress(current, total) {
    if (!progressBar || !progressText) return;
    
    const percent = Math.floor((current / total) * 100);
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${percent}%`;
}

function updateConvertProgress(current, total) {
    if (!convertProgressBar || !convertProgressText) return;
    
    const percent = Math.floor((current / total) * 100);
    convertProgressBar.style.width = `${percent}%`;
    convertProgressText.textContent = `${percent}%`;
}

function showProgress() {
    if (progressContainer) progressContainer.classList.remove('hidden');
}

function showConvertProgress() {
    if (convertProgressContainer) convertProgressContainer.classList.remove('hidden');
}

function resetProgress() {
    if (progressBar && progressText) {
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
    }
}

function resetConvertProgress() {
    if (convertProgressBar && convertProgressText) {
        convertProgressBar.style.width = '0%';
        convertProgressText.textContent = '0%';
    }
}

function timestamp() {
    return new Date().getTime();
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}