"use strict";

const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const filenameEl = document.getElementById('filename');
const analyzeBtn = document.getElementById('analyze-btn');
const resetBtn = document.getElementById('reset-btn');

const uploadSection = document.getElementById('upload-section');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');
const projectionSection = document.getElementById('projection-section');

const totalCheckedEl = document.getElementById('total-checked');
const wasteCountEl = document.getElementById('waste-count');
const avgConfidenceEl = document.getElementById('avg-confidence');
const resultsBody = document.getElementById('results-body');
const totalSavingsEl = document.getElementById('total-savings');

let selectedFile = null;

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

// Analysis
analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    uploadSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');

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
        alert('Error analyzing file. Make sure the server is running.');
        reset();
    }
});

function renderResults(data) {
    loadingSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    totalCheckedEl.textContent = data.summary.totalChecked;
    wasteCountEl.textContent = data.summary.wastefulCount;

    resultsBody.innerHTML = '';

    data.items.forEach(item => {
        const row = document.createElement('tr');
        
        // Only highlight if it's actually waste
        if (item.isWasteful) {
            row.classList.add('waste-row');
        }

        row.innerHTML = `
            <td>${item.originalIndex}</td>
            <td class="raw-text">${escapeHTML(item.rawContent)}</td>
            <td>${item.category || 'N/A'}</td>
            <td class="reason-text">${item.reasoning || 'No issues detected'}</td>
        `;
        resultsBody.appendChild(row);
    });

    // Check if subscriptions exist to show the projection section
    if (data.subscriptions && data.subscriptions.length > 0) {
        renderProjections(data.subscriptions);
    } else {
        projectionSection.classList.add('hidden');
    }
}

function renderProjections(subs) {
    let totalMonthly = subs.reduce((sum, sub) => sum + sub.amount, 0);
    let sixMonthSavings = totalMonthly * 6;
    
    totalSavingsEl.textContent = `₹${sixMonthSavings.toLocaleString('en-IN', { 
        maximumFractionDigits: 0 
    })}`;
    projectionSection.classList.remove('hidden');
}

function reset() {
    selectedFile = null;
    fileInput.value = '';
    filenameEl.textContent = '';
    analyzeBtn.disabled = true;

    resultsSection.classList.add('hidden');
    projectionSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
}

resetBtn.addEventListener('click', reset);

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
