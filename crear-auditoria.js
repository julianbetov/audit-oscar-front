let questions = [];
let generalObservations = "";

document
    .getElementById("csvFileInput")
    .addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const fileStatus = document.getElementById("fileStatus");
        fileStatus.innerHTML =
            '<div class="loading-spinner" style="width: 30px; height: 30px; border-width: 3px;"></div>';
        fileStatus.className = "file-status";

        Papa.parse(file, {
            complete: function (results) {
                try {
                    questions = [];

                    results.data.forEach((row, index) => {
                        if (row[0] && row[0].trim() !== "") {
                            questions.push({
                                id: index + 1,
                                pregunta: row[0].trim(),
                                respuesta: "",
                                observacion: "",
                            });
                        }
                    });

                    if (questions.length === 0) {
                        throw new Error(
                            "El archivo no contiene preguntas válidas"
                        );
                    }

                    document.getElementById(
                        "uploadButtonContainer"
                    ).style.display = "none";

                    fileStatus.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <strong>¡Archivo cargado exitosamente!</strong><br>
                    Se encontraron ${questions.length} preguntas
                `;
                    fileStatus.className = "file-status success";

                    const buttonHtml = `
                    <button class="btn btn-upload" style="margin-top: 20px;" onclick="startAudit()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 11l3 3L22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                        Responder las ${questions.length} preguntas
                    </button>
                `;
                    fileStatus.insertAdjacentHTML("beforeend", buttonHtml);
                } catch (error) {
                    document.getElementById(
                        "uploadButtonContainer"
                    ).style.display = "block";
                    fileStatus.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <strong>Error:</strong> ${error.message}
                `;
                    fileStatus.className = "file-status error";
                }
            },
            error: function (error) {
                document.getElementById("uploadButtonContainer").style.display =
                    "block";
                fileStatus.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <strong>Error al leer el archivo:</strong> ${error.message}
            `;
                fileStatus.className = "file-status error";
            },
        });
    });

function showQuestionsSection() {
    document.getElementById("questionsSection").style.display = "block";
    document.getElementById(
        "questionsTitle"
    ).textContent = `${questions.length} Preguntas Cargadas`;
    document.getElementById(
        "startButtonText"
    ).textContent = `Responder las ${questions.length} preguntas`;
}

function startAudit() {
    document.getElementById("uploadSection").style.display = "none";
    document.getElementById("questionsSection").style.display = "none";
    document.getElementById("auditForm").style.display = "block";

    renderQuestionCards();
    updateProgress();

    // Inicializar contador de caracteres
    const textarea = document.getElementById("generalObservations");
    textarea.addEventListener("input", function () {
        updateCharacterCount(this.value.length);
    });
}

function updateGeneralObservations(value) {
    generalObservations = value;
}

function updateCharacterCount(count) {
    document.getElementById("charCount").textContent = count;
}

function renderQuestionCards() {
    const container = document.getElementById("questionsCards");
    container.innerHTML = "";

    questions.forEach((question, index) => {
        const card = document.createElement("div");
        card.className = "question-card";
        card.id = `question-${question.id}`;

        card.innerHTML = `
            <div class="question-card-header">
                <div class="question-number">${index + 1}</div>
                <h3>Pregunta ${index + 1}</h3>
            </div>
            <div class="question-card-body">
                <div class="form-group">
                    <label for="pregunta-${
                        question.id
                    }" class="required">Texto de la Pregunta</label>
                    <input 
                        type="text" 
                        id="pregunta-${question.id}" 
                        class="form-input" 
                        value="${question.pregunta}"
                        data-question-id="${question.id}"
                        onchange="updateQuestion(${
                            question.id
                        }, 'pregunta', this.value)"
                    >
                    <div class="error-message" id="error-pregunta-${
                        question.id
                    }">Este campo es obligatorio</div>
                </div>

                <div class="form-group">
                    <label for="respuesta-${
                        question.id
                    }" class="required">Respuesta</label>
                    <select 
                        id="respuesta-${question.id}" 
                        class="form-select"
                        data-question-id="${question.id}"
                        onchange="updateQuestion(${
                            question.id
                        }, 'respuesta', this.value); updateProgress();"
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="Cumple">Cumple</option>
                        <option value="No Cumple">No Cumple</option>
                    </select>
                    <div class="error-message" id="error-respuesta-${
                        question.id
                    }">Debe seleccionar una respuesta</div>
                </div>

                <div class="form-group">
                    <label for="observacion-${
                        question.id
                    }">Observación Específica</label>
                    <textarea 
                        id="observacion-${question.id}" 
                        class="form-textarea"
                        placeholder="Ingrese observaciones específicas para esta pregunta (opcional)"
                        rows="4"
                        data-question-id="${question.id}"
                        onchange="updateQuestion(${
                            question.id
                        }, 'observacion', this.value)"
                    ></textarea>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function updateQuestion(id, field, value) {
    const question = questions.find((q) => q.id === id);
    if (question) {
        question[field] = value;
    }
}

function updateProgress() {
    const completed = questions.filter(
        (q) => q.pregunta.trim() !== "" && q.respuesta !== ""
    ).length;
    const total = questions.length;
    document.getElementById(
        "progressText"
    ).textContent = `${completed} de ${total} preguntas completadas`;
}

function validateForm() {
    let isValid = true;
    const errors = [];

    questions.forEach((question) => {
        const preguntaInput = document.getElementById(
            `pregunta-${question.id}`
        );
        const respuestaSelect = document.getElementById(
            `respuesta-${question.id}`
        );
        const preguntaError = document.getElementById(
            `error-pregunta-${question.id}`
        );
        const respuestaError = document.getElementById(
            `error-respuesta-${question.id}`
        );

        preguntaInput.classList.remove("error");
        respuestaSelect.classList.remove("error");
        preguntaError.classList.remove("show");
        respuestaError.classList.remove("show");

        if (!question.pregunta || question.pregunta.trim() === "") {
            preguntaInput.classList.add("error");
            preguntaError.classList.add("show");
            isValid = false;
            errors.push(`Pregunta ${question.id}: El texto es obligatorio`);
        }

        if (!question.respuesta || question.respuesta === "") {
            respuestaSelect.classList.add("error");
            respuestaError.classList.add("show");
            isValid = false;
            errors.push(
                `Pregunta ${question.id}: Debe seleccionar una respuesta`
            );
        }
    });

    return { isValid, errors };
}

function submitAudit() {
    const validation = validateForm();

    if (!validation.isValid) {
        alert(
            "Por favor complete todos los campos obligatorios:\n\n" +
                validation.errors.join("\n")
        );

        const firstError = document.querySelector(
            ".form-input.error, .form-select.error"
        );
        if (firstError) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
            firstError.focus();
        }
        return;
    }

    sendAuditData();
}

async function sendAuditData() {
    const submitBtn = document.querySelector(".btn-submit");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
        Enviando...
    `;

    document.getElementById("questionsCards").style.display = "none";
    document.getElementById("generalObservationsCard").style.display = "none";
    document.querySelector(".form-header").style.display = "none";

    try {
        const payload = {
            observaciones_generales: generalObservations,
            preguntas: questions.map((q) => ({
                pregunta: q.pregunta,
                respuesta: q.respuesta,
                observacion: q.observacion || "",
            })),
        };

        console.log("Enviando datos:", payload);

        const response = await fetch("http://localhost:8081/auditoria", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Respuesta recibida:", data);

        if (!data.id) {
            throw new Error("La respuesta no contiene un ID válido");
        }

        showSuccessMessage();
        await startAnalysis(data.id);
    } catch (error) {
        console.error("Error:", error);
        alert("Error al enviar la auditoría:\n\n" + error.message);

        document.getElementById("questionsCards").style.display = "grid";
        document.getElementById("generalObservationsCard").style.display =
            "block";
        document.querySelector(".form-header").style.display = "block";

        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Enviar Resultados
        `;
    }
}

function showSuccessMessage() {
    const formActions = document.querySelector(".form-actions");
    formActions.innerHTML = `
        <div class="success-message">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            <h3>¡Auditoría enviada exitosamente!</h3>
            <p>Generando análisis...</p>
        </div>
    `;
}

async function startAnalysis(auditId) {
    const formActions = document.querySelector(".form-actions");

    formActions.innerHTML = `
        <div class="analysis-loading">
            <div class="skeleton-container">
                <div class="skeleton-header">
                    <div class="skeleton-circle"></div>
                    <div class="skeleton-lines">
                        <div class="skeleton-line skeleton-line-short"></div>
                        <div class="skeleton-line skeleton-line-medium"></div>
                    </div>
                </div>
                <div class="skeleton-body">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line skeleton-line-short"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line skeleton-line-medium"></div>
                </div>
            </div>
            <p class="analysis-text">Analizando respuestas, por favor espere...</p>
        </div>
    `;

    try {
        console.log("Iniciando análisis para auditoría ID:", auditId);

        const response = await fetch(
            `http://localhost:8001/analisis?auditoria_id=${auditId}`,
            {
                method: "POST",
            }
        );

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const analysisData = await response.json();
        console.log("Análisis completado:", analysisData);

        showReportButton(auditId);
    } catch (error) {
        console.error("Error en análisis:", error);
        formActions.innerHTML = `
            <div class="error-state">
                <h3>⚠️ Error al generar el análisis</h3>
                <p><strong>Mensaje:</strong> ${error.message}</p>
                <button class="btn btn-primary" onclick="startAnalysis(${auditId})">
                    Reintentar
                </button>
            </div>
        `;
    }
}

function showReportButton(auditId) {
    const formActions = document.querySelector(".form-actions");

    formActions.innerHTML = `
        <div class="analysis-complete">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3>¡Análisis completado!</h3>
            <p>El reporte está listo para descargar</p>
            <button class="btn btn-submit" onclick="downloadReport(${auditId})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                </svg>
                Ver Reporte PDF
            </button>
        </div>
    `;
}

async function downloadReport(auditId) {
    const btn = event.target.closest(".btn-submit");
    btn.disabled = true;
    btn.innerHTML = `
        <div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
        Descargando...
    `;

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

        btn.disabled = false;
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
            </svg>
            Ver Reporte PDF
        `;
    } catch (error) {
        console.error("Error al descargar el reporte:", error);
        alert("Error al descargar el reporte:\n\n" + error.message);

        btn.disabled = false;
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>
            Ver Reporte PDF
        `;
    }
}

function showPdfModal(pdfUrl) {
    const existingModal = document.getElementById("pdfModal");
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.id = "pdfModal";
    modal.className = "modal-overlay active";
    modal.innerHTML = `
        <div class="modal-box" style="max-width: 95%; max-height: 95vh;">
            <div class="modal-header">
                <h2 class="modal-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Reporte de Auditoría
                </h2>
                <button class="close-button" onclick="closePdfModal()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body" style="padding: 0; height: calc(95vh - 100px);">
                <iframe src="${pdfUrl}" style="width: 100%; height: 100%; border: none;"></iframe>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            closePdfModal();
        }
    });
}

function closePdfModal() {
    const modal = document.getElementById("pdfModal");
    if (modal) {
        modal.remove();
    }
}

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closePdfModal();
    }
});
