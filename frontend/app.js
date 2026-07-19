/* ═══════════════════════════════════════════════════
   NutriLense — Frontend Application Logic
   ═══════════════════════════════════════════════════ */

const API_URL = '/api/sendimage';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ── DOM Elements ─────────────────────────────────
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const previewArea = document.getElementById('preview-area');
const previewImage = document.getElementById('preview-image');
const previewRemove = document.getElementById('preview-remove');
const previewFilename = document.getElementById('preview-filename');
const previewFilesize = document.getElementById('preview-filesize');
const analyzeBtn = document.getElementById('analyze-btn');

const heroSection = document.getElementById('hero-section');
const uploadSection = document.getElementById('upload-section');
const loadingSection = document.getElementById('loading-section');
const loadingText = document.getElementById('loading-text');
const resultsSection = document.getElementById('results-section');
const errorSection = document.getElementById('error-section');

const resultProductName = document.getElementById('result-product-name');
const summaryText = document.getElementById('summary-text');
const benefitsList = document.getElementById('benefits-list');
const benefitsEmpty = document.getElementById('benefits-empty');
const harmsList = document.getElementById('harms-list');
const harmsEmpty = document.getElementById('harms-empty');
const allergenTags = document.getElementById('allergen-tags');
const allergensEmpty = document.getElementById('allergens-empty');
const ingredientsWrap = document.getElementById('ingredients-wrap');
const ingredientsEmpty = document.getElementById('ingredients-empty');
const extractedTextContent = document.getElementById('extracted-text-content');

const scanAnotherBtn = document.getElementById('scan-another-btn');
const tryAgainBtn = document.getElementById('try-again-btn');
const errorTitle = document.getElementById('error-title');
const errorMessage = document.getElementById('error-message');

let selectedFile = null;

// ── File Selection ───────────────────────────────

// Click upload zone to trigger file picker
uploadZone.addEventListener('click', (e) => {
  if (e.target !== uploadBtn && !uploadBtn.contains(e.target)) {
    fileInput.click();
  }
});

// File input change
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFileSelect(file);
});

// Drag & Drop
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelect(file);
});

// Handle file selection
function handleFileSelect(file) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showError('Invalid File', 'Please upload an image file (JPG, PNG, WEBP).');
    return;
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    showError('File Too Large', 'Please upload an image smaller than 10MB.');
    return;
  }

  selectedFile = file;

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    previewFilename.textContent = file.name;
    previewFilesize.textContent = formatFileSize(file.size);

    uploadZone.classList.add('hidden');
    previewArea.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

// Remove preview
previewRemove.addEventListener('click', () => {
  resetUpload();
});

function resetUpload() {
  selectedFile = null;
  fileInput.value = '';
  previewImage.src = '';
  previewArea.classList.add('hidden');
  uploadZone.classList.remove('hidden');
}

// ── Analyze ──────────────────────────────────────

analyzeBtn.addEventListener('click', () => {
  if (!selectedFile) return;
  analyzeImage();
});

async function analyzeImage() {
  // Show loading
  showSection('loading');
  animateLoadingText();

  const formData = new FormData();
  formData.append('image', selectedFile);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error (${response.status})`);
    }

    const data = await response.json();
    displayResults(data);

  } catch (err) {
    console.error('Analysis failed:', err);
    showError(
      'Analysis Failed',
      err.message || 'Could not process the image. Please try again with a clearer photo of the food label.'
    );
  }
}

// ── Loading Text Animation ───────────────────────

const loadingMessages = [
  'Reading your food label...',
  'Extracting text from the image...',
  'Identifying ingredients...',
  'Analyzing nutritional content...',
  'Checking for allergens...',
  'Evaluating health impacts...',
  'Preparing your report...',
];

let loadingInterval = null;

function animateLoadingText() {
  let index = 0;
  loadingText.textContent = loadingMessages[0];

  if (loadingInterval) clearInterval(loadingInterval);

  loadingInterval = setInterval(() => {
    index = (index + 1) % loadingMessages.length;
    loadingText.style.opacity = '0';
    setTimeout(() => {
      loadingText.textContent = loadingMessages[index];
      loadingText.style.opacity = '1';
    }, 200);
  }, 2500);
}

function stopLoadingAnimation() {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
}

// ── Display Results ──────────────────────────────

function displayResults(data) {
  stopLoadingAnimation();

  const { extractedText, analysis } = data;

  // Product Name
  resultProductName.textContent = analysis.productName || 'Food Product';

  // Summary
  summaryText.textContent = analysis.summary || 'No summary available.';

  // Benefits
  benefitsList.innerHTML = '';
  if (analysis.benefits && analysis.benefits.length > 0) {
    benefitsEmpty.classList.add('hidden');
    analysis.benefits.forEach(b => {
      const li = document.createElement('li');
      li.textContent = b;
      benefitsList.appendChild(li);
    });
  } else {
    benefitsEmpty.classList.remove('hidden');
  }

  // Harms
  harmsList.innerHTML = '';
  if (analysis.harms && analysis.harms.length > 0) {
    harmsEmpty.classList.add('hidden');
    analysis.harms.forEach(h => {
      const li = document.createElement('li');
      li.textContent = h;
      harmsList.appendChild(li);
    });
  } else {
    harmsEmpty.classList.remove('hidden');
  }

  // Allergens
  allergenTags.innerHTML = '';
  if (analysis.allergens && analysis.allergens.length > 0) {
    allergensEmpty.classList.add('hidden');
    analysis.allergens.forEach(a => {
      const tag = document.createElement('span');
      tag.className = 'allergen-tag';
      tag.textContent = a;
      allergenTags.appendChild(tag);
    });
  } else {
    allergensEmpty.classList.remove('hidden');
  }

  // Ingredients
  ingredientsWrap.innerHTML = '';
  if (analysis.ingredients && analysis.ingredients.length > 0) {
    ingredientsEmpty.classList.add('hidden');
    analysis.ingredients.forEach(i => {
      const chip = document.createElement('span');
      chip.className = 'ingredient-chip';
      chip.textContent = i;
      ingredientsWrap.appendChild(chip);
    });
  } else {
    ingredientsEmpty.classList.remove('hidden');
  }

  // Extracted Text
  extractedTextContent.textContent = extractedText || 'No raw text available.';

  // Show results
  showSection('results');
}

// ── Section Management ───────────────────────────

function showSection(section) {
  // Hide all dynamic sections
  heroSection.classList.add('hidden');
  uploadSection.classList.add('hidden');
  loadingSection.classList.add('hidden');
  resultsSection.classList.add('hidden');
  errorSection.classList.add('hidden');

  switch (section) {
    case 'upload':
      heroSection.classList.remove('hidden');
      uploadSection.classList.remove('hidden');
      break;
    case 'loading':
      loadingSection.classList.remove('hidden');
      break;
    case 'results':
      resultsSection.classList.remove('hidden');
      break;
    case 'error':
      errorSection.classList.remove('hidden');
      break;
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Error Display ────────────────────────────────

function showError(title, message) {
  stopLoadingAnimation();
  errorTitle.textContent = title;
  errorMessage.textContent = message;
  showSection('error');
}

// ── Reset / Try Again ────────────────────────────

scanAnotherBtn.addEventListener('click', () => {
  resetUpload();
  showSection('upload');
});

tryAgainBtn.addEventListener('click', () => {
  resetUpload();
  showSection('upload');
});

// ── Utility Functions ────────────────────────────

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ── Init ─────────────────────────────────────────
// Add smooth transition for loading text
loadingText.style.transition = 'opacity 0.2s ease';
