import * as React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn'; // <-- Nuevo icono para Excel

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
                    sx={{
                        border: '1px solid',
                        borderColor: 'error.main',
                        bgcolor: 'rgba(244, 67, 54, 0.1)',
                        '&:hover': {
                            bgcolor: 'rgba(244, 67, 54, 0.2)',
                        },
                        width: 36,
                        height: 36,
                    }}
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
                        borderColor: 'success.main',
                        bgcolor: 'rgba(56, 142, 60, 0.1)',
                        '&:hover': {
                            bgcolor: 'rgba(56, 142, 60, 0.2)',
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
