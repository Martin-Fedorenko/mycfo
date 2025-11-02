import * as React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn'; // <-- Nuevo icono para Excel

const EXPORT_PDF_BG = '#FDE4E3';
const EXPORT_PDF_BG_HOVER = '#FACDCA';
const EXPORT_EXCEL_BG = '#E5F4E5';
const EXPORT_EXCEL_BG_HOVER = '#CAE7CB';

export default function ExportadorSimple({
                                             onExportPdf,
                                             onExportExcel,
                                             sx = {},
                                         }) {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                // NO posición fija por defecto para mayor flexibilidad
                ...sx,
            }}
        >
            <Tooltip title="Exportar PDF">
                <IconButton
                    onClick={onExportPdf}
                    size="small"
                    color="error"
                    sx={(theme) => ({
                        border: '1px solid',
                        borderColor: '#d32f2f',
                        // anillo sutil solo en dark para que siempre se vea el borde
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 0 0 1px rgba(255,255,255,0.18)'
                            : 'none',
                        bgcolor: `${EXPORT_PDF_BG} !important`,
                        backgroundColor: `${EXPORT_PDF_BG} !important`,
                        '& .MuiSvgIcon-root': {
                            color: '#000 !important',
                        },
                        '&:hover': {
                            bgcolor: `${EXPORT_PDF_BG_HOVER} !important`,
                            backgroundColor: `${EXPORT_PDF_BG_HOVER} !important`,
                            '& .MuiSvgIcon-root': {
                                color: '#000 !important',
                            },
                        },
                        width: 36,
                        height: 36,
                    })}
                    aria-label="Exportar PDF"
                >
                    <PictureAsPdfIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <Tooltip title="Exportar Excel">
                <IconButton
                    onClick={onExportExcel}
                    size="small"
                    color="success"
                    sx={{
                        border: '1px solid',
                        borderColor: '#2e7d32',
                        bgcolor: `${EXPORT_EXCEL_BG} !important`,
                        backgroundColor: `${EXPORT_EXCEL_BG} !important`,
                        '& .MuiSvgIcon-root': {
                            color: '#000 !important',
                        },
                        '&:hover': {
                            bgcolor: `${EXPORT_EXCEL_BG_HOVER} !important`,
                            backgroundColor: `${EXPORT_EXCEL_BG_HOVER} !important`,
                            '& .MuiSvgIcon-root': {
                                color: '#000 !important',
                            },
                        },
                        width: 36,
                        height: 36,
                    }}
                    aria-label="Exportar Excel"
                >
                    <GridOnIcon fontSize="small" /> {/* Icono de tabla tipo Excel */}
                </IconButton>
            </Tooltip>
        </Box>
    );
}
