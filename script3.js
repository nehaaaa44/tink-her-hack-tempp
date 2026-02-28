"use strict";

const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const filenameEl = document.getElementById('filename');
const analyzeBtn = document.getElementById('analyze-btn');
const resetBtn = document.getElementById('reset-btn');

const uploadSection = document.getElementById('upload-section');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');

const fileCard = document.getElementById('file-card');
const apiCard = document.getElementById('api-card');
const modeUploadBtn = document.getElementById('mode-upload');
const modeApiBtn = document.getElementById('mode-api');

const customerSelect = document.getElementById('customer-select');
const monthSelect = document.getElementById('month-select');
const fetchAnalyzeBtn = document.getElementById('fetch-analyze-btn');

const totalCheckedEl = document.getElementById('total-checked');
const wasteCountEl = document.getElementById('waste-count');
const resultsBody = document.getElementById('results-body');

let selectedFile = null;
let currentMode = 'upload'; // 'upload' or 'api'

// Mode Switching
modeUploadBtn.addEventListener('click', () => switchMode('upload'));
modeApiBtn.addEventListener('click', () => switchMode('api'));

async function switchMode(mode) {
    currentMode = mode;
    if (mode === 'upload') {
        modeUploadBtn.classList.add('active');
        modeApiBtn.classList.remove('active');
        fileCard.classList.remove('hidden');
        apiCard.classList.add('hidden');
    } else {
        modeUploadBtn.classList.remove('active');
        modeApiBtn.classList.add('active');
        fileCard.classList.add('hidden');
        apiCard.classList.remove('hidden');
        await loadApiData();
    }
}

async function loadApiData() {
    try {
        const timestamp = Date.now();
        const [cRes, mRes] = await Promise.all([
            fetch(`/api/customers?t=${timestamp}`),
            fetch(`/api/months?t=${timestamp}`)
        ]);

        const customers = await cRes.json();
        const months = await mRes.json();

        const cList = customers.customers || [];
        const mList = months.months || [];

        if (cList.length > 0) {
            customerSelect.innerHTML = cList.map(c => `<option value="${c}">${c}</option>`).join('');
        } else {
            customerSelect.innerHTML = '<option disabled>No customers found</option>';
        }

        if (mList.length > 0) {
            monthSelect.innerHTML = mList.map(m => `<option value="${m}">${m}</option>`).join('');
        } else {
            monthSelect.innerHTML = '<option disabled>No months found</option>';
        }
    } catch (err) {
        console.error('Failed to load API data:', err);
        if (customerSelect) customerSelect.innerHTML = `<option disabled>Error loading data</option>`;
    }
}

// File Selection
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
    }
});

function handleFileSelection(file) {
    selectedFile = file;
    filenameEl.textContent = file.name;
    analyzeBtn.disabled = false;
}

// Analysis (File)
analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    showLoading();
    const formData = new FormData();
    formData.append('statement', selectedFile);

    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Analysis failed');
        const data = await response.json();
        renderResults(data);
    } catch (err) {
        handleError(err);
    }
});

// Analysis (API)
fetchAnalyzeBtn.addEventListener('click', async () => {
    const customer = customerSelect.value;
    const month = monthSelect.value;

    if (!customer || !month) return;

    showLoading();

    try {
        const response = await fetch('/analyze-api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer, month })
        });

        if (!response.ok) throw new Error('API Analysis failed');
        const data = await response.json();
        renderResults(data);
    } catch (err) {
        handleError(err);
    }
});

function showLoading() {
    uploadSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
}

function renderResults(data) {
    loadingSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    totalCheckedEl.textContent = data.summary.totalChecked;
    wasteCountEl.textContent = data.summary.wastefulCount;

    resultsBody.innerHTML = '';

    data.items.forEach(item => {
        const row = document.createElement('tr');
        if (item.isWasteful) row.classList.add('waste-row');

        row.innerHTML = `
            <td>${item.originalIndex}</td>
            <td class="raw-text">${escapeHTML(item.rawContent)}</td>
            <td>
                ${item.isWasteful ? `<span class="rule-tag">${item.wasteDetails.ruleName}</span>` : '<span style="color:#555">None</span>'}
            </td>
            <td class="reason-text">
                ${item.isWasteful ? item.wasteDetails.reason : 'No issues detected.'}
            </td>
        `;
        resultsBody.appendChild(row);
    });
}

function reset() {
    selectedFile = null;
    fileInput.value = '';
    filenameEl.textContent = '';
    analyzeBtn.disabled = true;

    resultsSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
}

function handleError(err) {
    alert('Error analyzing data. Make sure both servers are running.');
    reset();
}

resetBtn.addEventListener('click', reset);

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
