import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            type = 'report', 
            title, 
            content, 
            data, 
            columns, 
            logo,
            companyName = '1cPublishing',
            footer = true
        } = await req.json();

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 20;

        // Header with company name
        doc.setFontSize(10);
        doc.setTextColor(128, 0, 128); // Purple
        doc.text(companyName, 20, y);
        doc.setTextColor(0, 0, 0);
        
        // Date
        doc.text(new Date().toLocaleDateString(), pageWidth - 40, y);
        y += 15;

        // Title
        if (title) {
            doc.setFontSize(24);
            doc.setFont(undefined, 'bold');
            doc.text(title, 20, y);
            y += 15;
            doc.setFont(undefined, 'normal');
        }

        switch (type) {
            case 'report':
                // Simple report with content
                if (content) {
                    doc.setFontSize(11);
                    const lines = doc.splitTextToSize(content, pageWidth - 40);
                    for (const line of lines) {
                        if (y > pageHeight - 30) {
                            doc.addPage();
                            y = 20;
                        }
                        doc.text(line, 20, y);
                        y += 6;
                    }
                }
                break;

            case 'invoice':
                // Invoice format
                if (data) {
                    doc.setFontSize(11);
                    
                    // Bill To
                    if (data.billTo) {
                        doc.setFont(undefined, 'bold');
                        doc.text('Bill To:', 20, y);
                        doc.setFont(undefined, 'normal');
                        y += 7;
                        doc.text(data.billTo.name || '', 20, y);
                        y += 5;
                        doc.text(data.billTo.address || '', 20, y);
                        y += 5;
                        doc.text(data.billTo.email || '', 20, y);
                        y += 15;
                    }

                    // Invoice details
                    if (data.invoiceNumber) {
                        doc.text(`Invoice #: ${data.invoiceNumber}`, pageWidth - 70, 50);
                        doc.text(`Date: ${data.date || new Date().toLocaleDateString()}`, pageWidth - 70, 57);
                        if (data.dueDate) {
                            doc.text(`Due: ${data.dueDate}`, pageWidth - 70, 64);
                        }
                    }

                    // Line items table
                    if (data.items && Array.isArray(data.items)) {
                        y += 5;
                        doc.setFont(undefined, 'bold');
                        doc.text('Description', 20, y);
                        doc.text('Qty', 120, y);
                        doc.text('Price', 145, y);
                        doc.text('Total', 170, y);
                        doc.setFont(undefined, 'normal');
                        y += 2;
                        doc.line(20, y, pageWidth - 20, y);
                        y += 7;

                        let total = 0;
                        for (const item of data.items) {
                            const itemTotal = (item.quantity || 1) * (item.price || 0);
                            total += itemTotal;
                            doc.text(item.description || '', 20, y);
                            doc.text(String(item.quantity || 1), 120, y);
                            doc.text(`$${(item.price || 0).toFixed(2)}`, 145, y);
                            doc.text(`$${itemTotal.toFixed(2)}`, 170, y);
                            y += 7;
                        }

                        y += 3;
                        doc.line(20, y, pageWidth - 20, y);
                        y += 10;
                        doc.setFont(undefined, 'bold');
                        doc.text('Total:', 145, y);
                        doc.text(`$${total.toFixed(2)}`, 170, y);
                    }
                }
                break;

            case 'table':
                // Table format with columns and data
                if (columns && data && Array.isArray(data)) {
                    doc.setFontSize(10);
                    const colWidth = (pageWidth - 40) / columns.length;
                    
                    // Headers
                    doc.setFont(undefined, 'bold');
                    columns.forEach((col, i) => {
                        doc.text(col.label || col.key, 20 + (i * colWidth), y);
                    });
                    doc.setFont(undefined, 'normal');
                    y += 2;
                    doc.line(20, y, pageWidth - 20, y);
                    y += 7;

                    // Rows
                    for (const row of data) {
                        if (y > pageHeight - 30) {
                            doc.addPage();
                            y = 20;
                        }
                        columns.forEach((col, i) => {
                            const value = String(row[col.key] || '');
                            doc.text(value.substring(0, 20), 20 + (i * colWidth), y);
                        });
                        y += 6;
                    }
                }
                break;
        }

        // Footer
        if (footer) {
            doc.setFontSize(8);
            doc.setTextColor(128);
            doc.text(`Generated by ${companyName}`, 20, pageHeight - 10);
            doc.text(`Page 1`, pageWidth - 30, pageHeight - 10);
        }

        const pdfBytes = doc.output('arraybuffer');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${title || 'document'}.pdf"`
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});