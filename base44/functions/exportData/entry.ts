import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import * as XLSX from 'npm:xlsx@0.18.5';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { format = 'csv', data, columns, sheetName = 'Data', filename = 'export' } = await req.json();

        if (!data || !Array.isArray(data)) {
            return Response.json({ error: 'Data array is required' }, { status: 400 });
        }

        // Prepare data with column headers if specified
        let exportData = data;
        if (columns && Array.isArray(columns)) {
            exportData = data.map(row => {
                const newRow = {};
                columns.forEach(col => {
                    const key = col.key || col;
                    const label = col.label || col;
                    newRow[label] = row[key];
                });
                return newRow;
            });
        }

        switch (format.toLowerCase()) {
            case 'csv': {
                // Generate CSV
                const headers = Object.keys(exportData[0] || {});
                const csvRows = [headers.join(',')];
                
                for (const row of exportData) {
                    const values = headers.map(h => {
                        const val = row[h];
                        if (val === null || val === undefined) return '';
                        const str = String(val);
                        // Escape quotes and wrap in quotes if contains comma
                        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                            return `"${str.replace(/"/g, '""')}"`;
                        }
                        return str;
                    });
                    csvRows.push(values.join(','));
                }
                
                const csv = csvRows.join('\n');
                
                return new Response(csv, {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': `attachment; filename="${filename}.csv"`
                    }
                });
            }

            case 'excel':
            case 'xlsx': {
                // Generate Excel
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
                
                // Auto-size columns
                const colWidths = [];
                const headers = Object.keys(exportData[0] || {});
                headers.forEach((h, i) => {
                    let maxWidth = h.length;
                    exportData.forEach(row => {
                        const val = String(row[h] || '');
                        if (val.length > maxWidth) maxWidth = val.length;
                    });
                    colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
                });
                worksheet['!cols'] = colWidths;
                
                const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
                
                return new Response(buffer, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'Content-Disposition': `attachment; filename="${filename}.xlsx"`
                    }
                });
            }

            case 'json': {
                return new Response(JSON.stringify(exportData, null, 2), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Disposition': `attachment; filename="${filename}.json"`
                    }
                });
            }

            default:
                return Response.json({ error: 'Invalid format. Use csv, excel, or json' }, { status: 400 });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});