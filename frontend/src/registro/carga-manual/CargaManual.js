import * as React from 'react';
import CargaManualForm from './components/CargaManualForm';
import {Box} from '@mui/material';

export default function CargaManual(props) {
  return (
    <>
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
        <CargaManualForm />
      </Box>
    </>
  );
}
