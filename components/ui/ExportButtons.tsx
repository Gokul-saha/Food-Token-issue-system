
import React from 'react';
import { Button } from './Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportButtonsProps {
    data: any[];
    filename: string;
    reportTitle: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data, filename, reportTitle }) => {
    if (!data || data.length === 0) {
        return null;
    }

    const headers = Object.keys(data[0]);
    
    // Function to sanitize data for CSV
    const escapeCsvCell = (cellData: any) => {
        let cell = cellData === null || cellData === undefined ? '' : String(cellData);
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            cell = '"' + cell.replace(/"/g, '""') + '"';
        }
        return cell;
    };

    const handleCsvExport = () => {
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => escapeCsvCell(row[header])).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleXlsxExport = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const handlePdfExport = () => {
        const doc = new jsPDF();
        doc.text(reportTitle, 14, 15);
        autoTable(doc, {
            startY: 20,
            head: [headers],
            body: data.map(row => headers.map(header => String(row[header] ?? ''))),
        });
        doc.save(`${filename}.pdf`);
    };

    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-600">Export as:</span>
            <Button variant="outline" size="sm" onClick={handleCsvExport}>CSV</Button>
            <Button variant="outline" size="sm" onClick={handleXlsxExport}>Excel</Button>
            <Button variant="outline" size="sm" onClick={handlePdfExport}>PDF</Button>
        </div>
    );
};

export default ExportButtons;
