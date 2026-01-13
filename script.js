const fields = ['inTitle', 'inSubTitle', 'inAddress', 'inContact', 'inReceiver', 'inAmount', 'inPaymentFor', 'inFromDate', 'inToDate', 'inReceivedBy'];
let debounceTimer;

// Initialize
window.onload = () => {
    // Set default date if empty
    const dateField = document.getElementById('inFromDate'); // Just picking one to check
    if (!localStorage.getItem('inFromDate')) {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('inFromDate').value = today;
        document.getElementById('inToDate').value = today;
    }

    fields.forEach(id => {
        const el = document.getElementById(id);
        const savedValue = localStorage.getItem(id);

        if (savedValue) {
            el.value = savedValue;
        }

        ['input', 'change'].forEach(evt => {
            el.addEventListener(evt, () => {
                localStorage.setItem(id, el.value);
                // Debounce the PDF generation
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(updatePreview, 500);
            });
        });
    });

    // Initial render
    updatePreview();
};

function getData() {
    const data = {};
    fields.forEach(id => {
        data[id] = document.getElementById(id).value || '';
    });

    // Formatting
    data.srNo = getSrNo(false); // Get current without incrementing
    data.dateISO = new Date().toISOString().split('T')[0];

    // Amount
    data.amountFormatted = data.inAmount ? `${data.inAmount} INR` : '........................';

    return data;
}

function getSrNo(increment = false) {
    let sr = parseInt(localStorage.getItem("srNo") || "0");
    if (increment) {
        sr++;
        localStorage.setItem("srNo", sr);
    }
    return sr.toString().padStart(5, "0");
}

function generateDocDefinition(data) {
    return {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: [
            // Header
            { text: data.inTitle || 'COMPANY TITLE', style: 'header' },
            { text: data.inSubTitle || 'Subtitle / Tagline', style: 'subheader' },
            { text: data.inAddress || 'Address Line 1, City, State, Pin Code', style: 'contact' },
            { text: data.inContact || 'Contact: +91 0000000000', style: 'contact', margin: [0, 0, 0, 10] },

            // Doc Title Box
            {
                table: {
                    widths: ['*'],
                    body: [
                        [{ text: 'PAYING GUEST RENT PAYMENT RECEIPT', style: 'docTitle' }]
                    ]
                },
                layout: {
                    hLineWidth: function (i) { return (i === 0 || i === 1) ? 1.5 : 0; },
                    vLineWidth: function (i) { return 0; },
                    hLineStyle: function (i) { return { dash: { length: 2 } }; }
                },
                margin: [0, 10, 0, 20]
            },

            // Main Table
            {
                style: 'tableExample',
                table: {
                    widths: ['25%', '5%', '25%', '10%', '10%', '5%', '20%'],
                    body: [
                        [
                            { text: 'SR. NO.', style: 'label' },
                            { text: ':', style: 'colon' },
                            { text: data.srNo, style: 'value' },
                            '',
                            { text: 'DATE', style: 'label', alignment: 'right' },
                            { text: ':', style: 'colon' },
                            { text: data.dateISO, style: 'value' }
                        ],
                        // Spacer row
                        [{ text: '', colSpan: 7, border: [false, false, false, false], lineHeight: 1.5 }, {}, {}, {}, {}, {}, {}],

                        [
                            { text: 'RECEIVED FROM', style: 'label' },
                            { text: ':', style: 'colon' },
                            { text: data.inReceiver || '........................', style: 'value', colSpan: 5 },
                            {}, {}, {}, {}
                        ],
                        [{ text: '', colSpan: 7, border: [false, false, false, false], lineHeight: 1.5 }, {}, {}, {}, {}, {}, {}],

                        [
                            { text: 'AMOUNT', style: 'label' },
                            { text: ':', style: 'colon' },
                            { text: data.amountFormatted, style: 'value', colSpan: 5 },
                            {}, {}, {}, {}
                        ],
                        [{ text: '', colSpan: 7, border: [false, false, false, false], lineHeight: 1.5 }, {}, {}, {}, {}, {}, {}],

                        [
                            { text: 'FOR PAYMENT OF', style: 'label' },
                            { text: ':', style: 'colon' },
                            { text: data.inPaymentFor || '........................', style: 'value', colSpan: 5 },
                            {}, {}, {}, {}
                        ],
                        [{ text: '', colSpan: 7, border: [false, false, false, false], lineHeight: 1.5 }, {}, {}, {}, {}, {}, {}],

                        [
                            { text: 'FROM', style: 'label' },
                            { text: ':', style: 'colon' },
                            { text: data.inFromDate || '...................', style: 'value' },
                            '',
                            { text: 'TO', style: 'label', alignment: 'right' },
                            { text: ':', style: 'colon' },
                            { text: data.inToDate || '...................', style: 'value' }
                        ],
                        [{ text: '', colSpan: 7, border: [false, false, false, false], lineHeight: 1.5 }, {}, {}, {}, {}, {}, {}],

                        [
                            { text: 'RECEIVED BY', style: 'label' },
                            { text: ':', style: 'colon' },
                            { text: data.inReceivedBy || '........................', style: 'value', colSpan: 5 },
                            {}, {}, {}, {}
                        ]
                    ]
                },
                layout: 'noBorders'
            },

            // Footer
            {
                margin: [0, 60, 20, 0],
                alignment: 'right',
                columns: [
                    { width: '*', text: '' },
                    {
                        width: 'auto',
                        stack: [
                            { text: data.inReceivedBy || '', bold: true, margin: [0, 0, 0, 5] },
                            { text: '(SIGNED)', italics: true, fontSize: 10, decoration: 'overline' }
                        ]
                    }
                ]
            },

            // Bottom Badge
            {
                margin: [0, 40, 0, 0],
                table: {
                    widths: ['*'],
                    body: [
                        [{ text: '* END *', style: 'docFooter' }]
                    ]
                },
                layout: {
                    hLineWidth: function (i) { return (i === 0) ? 1 : 0; },
                    vLineWidth: function (i) { return 0; },
                    hLineColor: function (i) { return '#ccc'; }
                }
            }
        ],
        styles: {
            header: {
                fontSize: 24,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 5],
                font: 'Roboto' // PDFMake default font, looks clean
            },
            subheader: {
                fontSize: 16,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 2]
            },
            contact: {
                fontSize: 10,
                alignment: 'center',
                margin: [0, 0, 0, 2]
            },
            docTitle: {
                fontSize: 14,
                bold: true,
                alignment: 'center',
                margin: [5, 5, 5, 5]
            },
            docFooter: {
                fontSize: 9,
                color: '#666',
                alignment: 'center',
                margin: [5, 5, 5, 5]
            },
            label: {
                bold: true,
                fontSize: 11
            },
            colon: {
                bold: true,
                alignment: 'center'
            },
            value: {
                fontSize: 11,
                decoration: 'underline',
                decorationStyle: 'dotted'
            }
        },
        defaultStyle: {
            fontSize: 11
        }
    };
}

function updatePreview() {
    const data = getData();
    const docDefinition = generateDocDefinition(data);

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob) => {
        const url = URL.createObjectURL(blob);
        document.getElementById('pdf-preview').src = url;
    });
}

function downloadPDF() {
    // Increment Sr No only on explicit download/print
    getSrNo(true);
    const data = getData();

    // Clean filename
    let receivedFrom = data.inReceiver || "UNKNOWN";
    receivedFrom = receivedFrom.replace(/[^a-z0-9]/gi, "_");

    // Regenerate to show updated Sr No
    const docDefinition = generateDocDefinition(data);

    // Download
    pdfMake.createPdf(docDefinition).download(`Receipt_${receivedFrom}_${data.srNo}.pdf`);

    // Update preview to show the new number
    updatePreview();
}

function printPDF() {
    // Increment Sr No
    getSrNo(true);
    const data = getData();
    const docDefinition = generateDocDefinition(data);

    pdfMake.createPdf(docDefinition).print();
    updatePreview();
}