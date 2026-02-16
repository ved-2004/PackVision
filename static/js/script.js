// Page elements
const uploadPage = document.getElementById('uploadPage');
const loadingPage = document.getElementById('loadingPage');
const checklistPage = document.getElementById('checklistPage');

// Form elements
const uploadForm = document.getElementById('uploadForm');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');

// Checklist elements
const checklistContainer = document.getElementById('checklistContainer');
const destinationInfo = document.getElementById('destinationInfo');
const dateInfo = document.getElementById('dateInfo');

// Buttons
const backBtn = document.getElementById('backBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Store uploaded files
let uploadedFiles = [];

// Upload area click handler
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Drag and drop handlers
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
});

// File input change handler
fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
});

// Handle file uploads
function handleFiles(files) {
    files.forEach(file => {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            uploadedFiles.push(file);
            displayFilePreview(file);
        }
    });
}

// Display file preview
function displayFilePreview(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';

    const fileURL = URL.createObjectURL(file);

    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = fileURL;
        img.alt = file.name;
        fileItem.appendChild(img);
    } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = fileURL;
        video.muted = true;
        fileItem.appendChild(video);
    }

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-file';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = uploadedFiles.indexOf(file);
        if (index > -1) {
            uploadedFiles.splice(index, 1);
        }
        fileItem.remove();
        URL.revokeObjectURL(fileURL);
    });

    fileItem.appendChild(removeBtn);
    filePreview.appendChild(fileItem);
}

// Form submission
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (uploadedFiles.length === 0) {
        alert('Please upload at least one image or video');
        return;
    }

    // Collect form data
    const formData = new FormData();
    
    // Add files
    uploadedFiles.forEach((file, index) => {
        formData.append('files', file);
    });

    // Add form fields
    formData.append('destination', document.getElementById('destination').value);
    formData.append('start_date', document.getElementById('startDate').value);
    formData.append('end_date', document.getElementById('endDate').value);
    formData.append('notes', document.getElementById('notes').value);

    // Show loading page
    showPage('loading');

    try {
        // Call your FastAPI backend
        const response = await fetch('/api/generate-checklist', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to generate checklist');
        }

        const data = await response.json();
        
        // Display checklist
        displayChecklist(data);
        showPage('checklist');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate checklist. Please try again.');
        showPage('upload');
    }
});

// Display checklist
function displayChecklist(data) {
    // Set destination and date info
    destinationInfo.textContent = `Destination: ${data.destination}`;
    
    const startDate = new Date(data.start_date).toLocaleDateString();
    const endDate = new Date(data.end_date).toLocaleDateString();
    dateInfo.textContent = `Travel Dates: ${startDate} - ${endDate}`;

    // Clear existing checklist
    checklistContainer.innerHTML = '';

    // Group items by category
    const categories = data.checklist || {};

    Object.keys(categories).forEach(categoryName => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'checklist-category';

        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = categoryName;
        categoryDiv.appendChild(categoryTitle);

        categories[categoryName].forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'checklist-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `item-${categoryName}-${index}`;

            const label = document.createElement('label');
            label.htmlFor = `item-${categoryName}-${index}`;
            label.textContent = item;

            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(label);
            categoryDiv.appendChild(itemDiv);
        });

        checklistContainer.appendChild(categoryDiv);
    });
}

// Page navigation
function showPage(page) {
    uploadPage.classList.remove('active');
    loadingPage.classList.remove('active');
    checklistPage.classList.remove('active');

    if (page === 'upload') {
        uploadPage.classList.add('active');
    } else if (page === 'loading') {
        loadingPage.classList.add('active');
    } else if (page === 'checklist') {
        checklistPage.classList.add('active');
    }
}

// Back button
backBtn.addEventListener('click', () => {
    // Reset form
    uploadForm.reset();
    uploadedFiles = [];
    filePreview.innerHTML = '';
    showPage('upload');
});

// Download checklist
downloadBtn.addEventListener('click', () => {
    const checklistText = generateChecklistText();
    const blob = new Blob([checklistText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'travel-checklist.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Generate checklist text for download
function generateChecklistText() {
    let text = `TRAVEL CHECKLIST\n`;
    text += `================\n\n`;
    text += `${destinationInfo.textContent}\n`;
    text += `${dateInfo.textContent}\n\n`;

    const categories = checklistContainer.querySelectorAll('.checklist-category');
    categories.forEach(category => {
        const title = category.querySelector('.category-title').textContent;
        text += `\n${title}\n`;
        text += `${'-'.repeat(title.length)}\n`;

        const items = category.querySelectorAll('.checklist-item label');
        items.forEach(item => {
            text += `☐ ${item.textContent}\n`;
        });
    });

    return text;
}

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('startDate').setAttribute('min', today);
document.getElementById('endDate').setAttribute('min', today);

// Update end date minimum when start date changes
document.getElementById('startDate').addEventListener('change', (e) => {
    document.getElementById('endDate').setAttribute('min', e.target.value);
});