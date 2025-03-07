import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatFeedbackData = (feedbacks) => {
    return feedbacks.map(feedback => ({
        'Transaction ID': feedback.transaction,
        'Donor': feedback.donor,
        'Receiver': feedback.receiver,
        'Donor Rating': feedback.donorFeedback?.rating || 'N/A',
        'Donor Comment': feedback.donorFeedback?.comment || 'N/A',
        'Receiver Rating': feedback.receiverFeedback?.rating || 'N/A',
        'Receiver Comment': feedback.receiverFeedback?.comment || 'N/A',
        'Date': new Date(feedback.createdAt).toLocaleDateString()
    }));
};

export const exportToCSV = (feedbacks) => {
    const data = formatFeedbackData(feedbacks);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedbacks");
    const excelBuffer = XLSX.write(workbook, { bookType: 'csv', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/csv' });
    saveAs(dataBlob, 'feedbacks.csv');
};

export const exportToExcel = (feedbacks) => {
    const data = formatFeedbackData(feedbacks);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedbacks");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, 'feedbacks.xlsx');
};

export const exportToPDF = (feedbacks) => {
    const doc = new jsPDF();
    const data = formatFeedbackData(feedbacks);
    
    doc.text('Feedback Report', 14, 15);
    
    doc.autoTable({
        head: [Object.keys(data[0])],
        body: data.map(Object.values),
        startY: 25,
        styles: { overflow: 'linebreak' },
        columnStyles: { text: { cellWidth: 'auto' } }
    });

    doc.save('feedbacks.pdf');
};

export const exportPickupToPDF = (pickup) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Title
    doc.setFontSize(20);
    doc.text('Pickup Details Report', pageWidth/2, 15, { align: 'center' });
    
    // Basic Information
    doc.setFontSize(16);
    doc.text('Basic Information', 14, 30);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(pickup.createdAt).toLocaleString()}`, 14, 40);
    doc.text(`Status: ${pickup.status}`, 14, 47);
    doc.text(`Quantity: ${pickup.quantity}kg`, 14, 54);
    doc.text(`Waste Type: ${pickup.wasteType}`, 14, 61);
    doc.text(`Item Type: ${pickup.itemType}`, 14, 68);

    // Participants
    doc.setFontSize(16);
    doc.text('Participants', 14, 85);
    doc.setFontSize(12);
    doc.text(`Donor: ${pickup.donor?.username || pickup.donor}`, 14, 95);
    doc.text(`Donor Role: ${pickup.donor?.role || '-'}`, 14, 102);
    doc.text(`Receiver: ${pickup.receiver?.username || pickup.receiver}`, 14, 109);
    doc.text(`Receiver Role: ${pickup.receiver?.role || '-'}`, 14, 116);

    // Completion Details (if completed)
    if (pickup.completedAt) {
        doc.setFontSize(16);
        doc.text('Completion Details', 14, 133);
        doc.setFontSize(12);
        doc.text(`Completed At: ${new Date(pickup.completedAt).toLocaleString()}`, 14, 143);
        if (pickup.additionalPoints) {
            doc.text(`Additional Points: ${pickup.additionalPoints}`, 14, 150);
        }
        if (pickup.completionNotes) {
            doc.text(`Notes: ${pickup.completionNotes}`, 14, 157);
        }
    }

    // QR Code History
    if (pickup.qrCodes?.length > 0) {
        doc.setFontSize(16);
        doc.text('QR Code History', 14, pickup.completedAt ? 174 : 133);
        
        const qrTableData = pickup.qrCodes.map(qr => [
            new Date(qr.generatedAt).toLocaleString(),
            qr.status,
            qr.scannedBy || '-',
            qr.scannedAt ? new Date(qr.scannedAt).toLocaleString() : '-'
        ]);

        doc.autoTable({
            head: [['Generated', 'Status', 'Scanned By', 'Scanned At']],
            body: qrTableData,
            startY: pickup.completedAt ? 180 : 140,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [66, 66, 66] }
        });
    }

    doc.save(`pickup-${pickup._id}.pdf`);
};

export const exportAllPickupsToPDF = (pickups) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(20);
    doc.text('Pickups Report', pageWidth/2, 15, { align: 'center' });

    // Summary
    doc.setFontSize(12);
    doc.text(`Total Pickups: ${pickups.length}`, 14, 25);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);

    // Create table data
    const tableData = pickups.map(pickup => [
        new Date(pickup.createdAt).toLocaleDateString(),
        pickup.donor?.username || pickup.donor,
        pickup.receiver?.username || pickup.receiver,
        pickup.status,
        `${pickup.quantity}kg ${pickup.wasteType}`,
        pickup.completedAt ? new Date(pickup.completedAt).toLocaleDateString() : '-'
    ]);

    doc.autoTable({
        head: [['Date', 'Donor', 'Receiver', 'Status', 'Details', 'Completed']],
        body: tableData,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 66, 66] },
        columnStyles: {
            0: { cellWidth: 25 },
            3: { cellWidth: 20 },
            5: { cellWidth: 25 }
        }
    });

    doc.save('all-pickups.pdf');
}; 