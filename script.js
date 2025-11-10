let auditorias = [];

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
}

function getAnswerClass(respuesta) {
    const resp = respuesta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (resp === 'si') return 'answer-si';
    if (resp === 'no') return 'answer-no';
    return 'answer-talves';
}

function createCalendarIcon() {
    return `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    `;
}

function createEyeIcon() {
    return `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    `;
}

function createFileIcon() {
    return `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
        </svg>
    `;
}

function renderCards(data) {
    const content = document.getElementById('content');
    content.innerHTML = '';

    data.forEach((auditoria, index) => {
        const card = document.createElement('div');
        card.className = 'auditoria-card';
        card.innerHTML = `
            <div class="card-header">
                <span class="card-number-badge">AUDITORÍA #${String(
                    index + 1
                ).padStart(3, "0")}</span>
                <h3 class="card-title">ID: ${auditoria.id}</h3>
                <div class="card-date">
                    ${createCalendarIcon()}
                    <span>${formatDate(auditoria.fecha)}</span>
                </div>
            </div>
            <div class="card-body">
                <div class="info-grid">
                    <div class="info-row">
                        <span class="info-label">Total de Preguntas</span>
                        <span class="info-value">${
                            auditoria.totalDeRegistros
                        }</span>
                    </div>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn btn-secondary" onclick="downloadReport(${
                    auditoria.id
                })">
                    ${createFileIcon()}
                    Ver Reporte
                </button>
                <button class="btn btn-primary" onclick="showQuestions(${index})">
                    ${createEyeIcon()}
                    Ver Preguntas
                </button>
            </div>
        `;
        content.appendChild(card);
    });
}

async function downloadReport(auditId) {

    try {
        console.log("Descargando reporte para auditoría ID:", auditId);

        const response = await fetch(
            `http://localhost:8081/archivo/${auditId}`,
            {
                method: "GET",
            }
        );

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const analysisData = await response.json();
        console.log(response);
        console.log("Datos del archivo recibidos");

        if (!analysisData.pdfBytes) {
            throw new Error("No se recibieron datos del PDF");
        }

        let pdfData = analysisData.pdfBytes;

        if (typeof pdfData === "string") {
            pdfData = pdfData.replace(/^data:application\/pdf;base64,/, "");

            const binaryString = atob(pdfData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            pdfData = bytes;
        }

        const blob = new Blob([pdfData], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(blob);

        window.open(pdfUrl, "_blank");

    } catch (error) {
        console.error("Error al descargar el reporte:", error);
        alert("Error al descargar el reporte:\n\n" + error.message);
    }
}

function showQuestions(index) {
    const auditoria = auditorias[index];
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    auditoria.registros.forEach((registro, idx) => {
        const row = document.createElement('tr');
        
        // Truncar observación si es muy larga
        let observacion = registro.observacion;
        const maxLength = 100;
        if (observacion && observacion.length > maxLength) {
            observacion = observacion.substring(0, maxLength) + '...';
        }
        
        row.innerHTML = `
            <td><strong>${idx + 1}</strong></td>
            <td>${registro.pregunta}</td>
            <td><span class="answer-badge ${getAnswerClass(registro.respuesta)}">${registro.respuesta}</span></td>
            <td title="${registro.observacion}">${observacion || '-'}</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

async function loadData() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <h2>Cargando Auditorías</h2>
            <p>Por favor espere...</p>
        </div>
    `;

    try {
        const response = await fetch('http://localhost:8081/auditoria/');
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        auditorias = data;
        renderCards(data);

    } catch (error) {
        content.innerHTML = `
            <div class="error-state">
                <h3>⚠️ Error al Cargar las Auditorías</h3>
                <p><strong>Mensaje:</strong> ${error.message}</p>
                <p>Verifica que el servidor esté funcionando en:</p>
                <p><strong>http://localhost:8081/auditoria/</strong></p>
            </div>
        `;
        console.error('Error:', error);
    }
}

window.onload = loadData;