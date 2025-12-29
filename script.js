const fields = ['inTitle', 'inSubTitle', 'inAddress', 'inContact', 'inReceiver', 'inAmount', 'inPaymentFor', 'inFromDate', 'inToDate', 'inReceivedBy'];

// Initialize
window.onload = () => {
    // Set default date
    document.getElementById('outDate').innerText =
        new Date().toISOString().split('T')[0];

    fields.forEach(id => {
        const el = document.getElementById(id);
        const savedValue = localStorage.getItem(id);

        if (savedValue) {
            el.value = savedValue;
        }

        // Handle both typing & date change
        ['input', 'change'].forEach(evt => {
            el.addEventListener(evt, () => {
                updatePreview();
                localStorage.setItem(id, el.value);
            });
        });
    });

    updatePreview();
};


function updatePreview() {
    const mappings = {
        inTitle: 'outTitle', inSubTitle: 'outSubTitle', inAddress: 'outAddress',
        inContact: 'outContact', inReceiver: 'outReceiver',
        inAmount: 'outAmount', inPaymentFor: 'outPaymentFor', 
        inFromDate: 'outFrom', inToDate: 'outTo', inReceivedBy: 'outReceivedBy'
    };

    for (let key in mappings) {
        let val = document.getElementById(key).value;

        if (key === 'inAmount' && val !== "........................") {
            val = `${val} INR`;
        }

        document.getElementById(mappings[key]).innerText = val || "........................";
    }

    document.getElementById("outSignName").innerText = inReceivedBy.value || "........................";
}

function getNextSrNo() {
    let sr = parseInt(localStorage.getItem("srNo") || "0");
    sr++;
    localStorage.setItem("srNo", sr);
    return sr.toString().padStart(5, "0");
}

async function printPDF() {
    const srNo = getNextSrNo();
    document.getElementById("outSrNo").innerText = srNo;

    // Give DOM time to update SR NO
    setTimeout(() => {
        window.print();
    }, 100);
}


async function downloadPDF() {
    const srNo = getNextSrNo();
    document.getElementById("outSrNo").innerText = srNo;

    // Get value from input (NOT innerText)
    let receivedFrom = document.getElementById("inReceiver").value || "UNKNOWN";

    // Clean filename (remove spaces & special chars)
    receivedFrom = receivedFrom.replace(/[^a-z0-9]/gi, "_");

    const { jsPDF } = window.jspdf;
    const element = document.getElementById('pdf-a4');

    // High-quality render
    const canvas = await html2canvas(element, { scale: 3 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

    // Correct filename
    pdf.save(`Receipt_${receivedFrom}_${srNo}.pdf`);
}

let currentZoom = 0.5; // Default starting zoom

function adjustZoom(amount) {
    currentZoom += amount;
    // Keep zoom within reasonable limits
    if (currentZoom < 0.2) currentZoom = 0.2;
    if (currentZoom > 2.0) currentZoom = 2.0;
    applyZoom();
}

function resetZoom() {
    currentZoom = 0.5;
    applyZoom();
}

function applyZoom() {
    const page = document.getElementById('pdf-a4');
    page.style.transform = `scale(${currentZoom})`;
    page.style.transform = `scale(${currentZoom})`;
}