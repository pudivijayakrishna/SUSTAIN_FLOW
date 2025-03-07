import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    FormControl,
    FormControlLabel,
    Checkbox,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    Divider,
    Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AVAILABLE_COLUMNS = {
    sender: 'Sender',
    receiver: 'Receiver',
    type: 'Type',
    itemCategory: 'Category',
    itemName: 'Item Name',
    wasteType: 'Waste Type',
    itemType: 'Item Type',
    quantity: 'Quantity',
    description: 'Description',
    points: 'Points',
    status: 'Status',
    createdAt: 'Date'
};

const ExportPreview = ({ open, onClose, data, currentFilters }) => {
    const [selectedColumns, setSelectedColumns] = useState(Object.keys(AVAILABLE_COLUMNS));
    const [exportFormat, setExportFormat] = useState('xlsx');
    const [startDate, setStartDate] = useState(currentFilters?.startDate || null);
    const [endDate, setEndDate] = useState(currentFilters?.endDate || null);
    const [selectedTypes, setSelectedTypes] = useState(['ngo', 'compostAgency']);
    const [previewData, setPreviewData] = useState([]);

    useEffect(() => {
        if (data?.length) {
            setPreviewData(filterData(data).slice(0, 5));
        }
    }, [data, startDate, endDate, selectedTypes]);

    const filterData = (data) => {
        return data.filter(item => {
            // Date filter
            if (startDate && endDate) {
                const itemDate = new Date(item.createdAt);
                if (itemDate < startDate || itemDate > endDate) return false;
            }
            // Type filter
            if (selectedTypes.length && !selectedTypes.includes(item.type)) return false;
            return true;
        });
    };

    const handleColumnToggle = (column) => {
        setSelectedColumns(prev => 
            prev.includes(column) 
                ? prev.filter(col => col !== column)
                : [...prev, column]
        );
    };

    const formatData = (data) => {
        return data.map(item => {
            const formattedItem = {};
            selectedColumns.forEach(column => {
                if (column === 'createdAt') {
                    formattedItem[AVAILABLE_COLUMNS[column]] = new Date(item[column]).toLocaleDateString();
                } else {
                    formattedItem[AVAILABLE_COLUMNS[column]] = item[column] || '';
                }
            });
            return formattedItem;
        });
    };

    const exportData = () => {
        const filteredData = filterData(data);
        const formattedData = formatData(filteredData);
        const fileName = `transactions_${new Date().toISOString().split('T')[0]}`;

        // Create metadata array
        const metadata = [
            ['Export Date', new Date().toLocaleString()],
            ['Total Records', filteredData.length.toString()],
            ['Date Range', startDate && endDate ? `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}` : 'All Time'],
            ['Transaction Types', selectedTypes.join(', ')],
            [], // Empty row for spacing
        ];

        if (exportFormat === 'xlsx') {
            const wb = XLSX.utils.book_new();
            
            // Add metadata sheet
            const metadataWs = XLSX.utils.aoa_to_sheet(metadata);
            
            // Set column widths for metadata
            metadataWs['!cols'] = [{ wch: 15 }, { wch: 50 }];
            
            // Add styles to metadata cells
            const metadataStyle = {
                font: { bold: true },
                fill: { fgColor: { rgb: "EEEEEE" } }
            };

            // Apply styles to non-empty metadata rows
            metadata.forEach((row, rowIndex) => {
                if (row.length > 0) {
                    row.forEach((_, colIndex) => {
                        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
                        if (!metadataWs[cellRef]) {
                            metadataWs[cellRef] = { v: '' };
                        }
                        metadataWs[cellRef].s = metadataStyle;
                    });
                }
            });
            
            XLSX.utils.book_append_sheet(wb, metadataWs, 'Metadata');
            
            // Add data sheet
            if (formattedData.length > 0) {
                const ws = XLSX.utils.json_to_sheet(formattedData);
                
                // Set column widths for data
                ws['!cols'] = selectedColumns.map(() => ({ wch: 15 }));
                
                // Add styles to header row
                const headerStyle = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: "EEEEEE" } }
                };

                // Apply styles to header cells
                const headers = Object.keys(formattedData[0]);
                headers.forEach((_, colIndex) => {
                    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
                    if (!ws[cellRef]) {
                        ws[cellRef] = { v: '' };
                    }
                    ws[cellRef].s = headerStyle;
                });
                
                XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
            } else {
                // Add empty sheet if no data
                const emptyWs = XLSX.utils.aoa_to_sheet([['No data available']]);
                XLSX.utils.book_append_sheet(wb, emptyWs, 'Transactions');
            }
            
            const wbout = XLSX.write(wb, { 
                bookType: 'xlsx', 
                type: 'array',
                bookSST: false,
                cellStyles: true
            });
            
            saveAs(
                new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 
                `${fileName}.xlsx`
            );
        } else {
            // For CSV format
            const csvMetadata = metadata.map(row => row.join(',')).join('\n');
            const csvHeaders = selectedColumns.map(col => AVAILABLE_COLUMNS[col]).join(',');
            const csvData = formattedData.map(row => 
                selectedColumns.map(col => {
                    const value = row[AVAILABLE_COLUMNS[col]];
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"`
                        : value;
                }).join(',')
            ).join('\n');

            const csvContent = [
                csvMetadata,
                '', // Empty line
                csvHeaders,
                csvData
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `${fileName}.csv`);
        }
        onClose();
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Export Transactions</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3}>
                        {/* Export Format */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Export Format</InputLabel>
                                <Select
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value)}
                                    label="Export Format"
                                >
                                    <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
                                    <MenuItem value="csv">CSV</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Date Range */}
                        <Grid item xs={12} md={6}>
                            <Box display="flex" gap={2}>
                                <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={setStartDate}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                                <DatePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={setEndDate}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </Box>
                        </Grid>

                        {/* Transaction Types */}
                        <Grid item xs={12}>
                            <FormControl component="fieldset">
                                <Typography variant="subtitle2" gutterBottom>
                                    Transaction Types
                                </Typography>
                                <Box display="flex" gap={2}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedTypes.includes('ngo')}
                                                onChange={(e) => {
                                                    setSelectedTypes(prev => 
                                                        e.target.checked 
                                                            ? [...prev, 'ngo']
                                                            : prev.filter(t => t !== 'ngo')
                                                    );
                                                }}
                                            />
                                        }
                                        label="NGO"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedTypes.includes('compostAgency')}
                                                onChange={(e) => {
                                                    setSelectedTypes(prev => 
                                                        e.target.checked 
                                                            ? [...prev, 'compostAgency']
                                                            : prev.filter(t => t !== 'compostAgency')
                                                    );
                                                }}
                                            />
                                        }
                                        label="Compost Agency"
                                    />
                                </Box>
                            </FormControl>
                        </Grid>

                        {/* Column Selection */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                                Select Columns
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={2}>
                                {Object.entries(AVAILABLE_COLUMNS).map(([key, label]) => (
                                    <FormControlLabel
                                        key={key}
                                        control={
                                            <Checkbox
                                                checked={selectedColumns.includes(key)}
                                                onChange={() => handleColumnToggle(key)}
                                            />
                                        }
                                        label={label}
                                    />
                                ))}
                            </Box>
                        </Grid>

                        {/* Preview */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                                Preview (First 5 records)
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            {selectedColumns.map(column => (
                                                <TableCell key={column}>
                                                    {AVAILABLE_COLUMNS[column]}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {previewData.map((row, index) => (
                                            <TableRow key={index}>
                                                {selectedColumns.map(column => (
                                                    <TableCell key={column}>
                                                        {column === 'createdAt' 
                                                            ? new Date(row[column]).toLocaleDateString()
                                                            : row[column] || '-'}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button 
                        onClick={exportData} 
                        variant="contained" 
                        disabled={!selectedColumns.length}
                    >
                        Export
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default ExportPreview; 