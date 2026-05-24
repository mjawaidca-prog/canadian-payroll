import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  AppBar,
  Toolbar,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useRouter } from 'next/router';
import api from '../../lib/api';

export default function GenerateT4() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [t4Records, setT4Records] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    organizationId: '',
    taxYear: new Date().getFullYear().toString(),
    businessNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateT4 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.organizationId) {
      setError('Organization ID is required');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        `/reporting/t4/generate/${formData.organizationId}/${formData.taxYear}`
      );
      setT4Records(response.data.data);
      setSuccess(`Generated T4 records for ${response.data.data.length} employees`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate T4 records');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateRecords = async () => {
    if (t4Records.length === 0) {
      setError('No records to validate');
      return;
    }

    try {
      await api.post('/reporting/t4/validate', { records: t4Records });
      setSuccess('All T4 records passed validation');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Validation failed');
    }
  };

  const handleExportXML = async () => {
    if (t4Records.length === 0) {
      setError('No records to export');
      return;
    }

    if (!formData.businessNumber) {
      setError('Business Number is required for XML export');
      return;
    }

    try {
      const response = await api.post(
        '/reporting/t4/export-xml',
        {
          records: t4Records,
          businessNumber: formData.businessNumber,
        },
        {
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `t4-${formData.taxYear}.xml`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setSuccess('XML exported successfully');
    } catch (err: any) {
      setError('Failed to export XML');
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            T4 Reporting
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleGenerateT4}>
            <Typography variant="h6" gutterBottom>
              Generate T4 Records
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Organization ID"
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tax Year"
                  name="taxYear"
                  type="number"
                  value={formData.taxYear}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: '2020', max: new Date().getFullYear() }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Business Number (for XML export)"
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleChange}
                  fullWidth
                  placeholder="123456789RC0001"
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate T4 Records'}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => router.push('/reporting')}
                disabled={loading}
              >
                Back
              </Button>
            </Box>
          </Box>
        </Paper>

        {t4Records.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              T4 Records Summary
            </Typography>

            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">
                    Total Employees
                  </Typography>
                  <Typography variant="h6">{t4Records.length}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">
                    Total Employment Income (Box 14)
                  </Typography>
                  <Typography variant="h6">
                    $
                    {t4Records
                      .reduce((sum, r) => sum + r.box14, 0)
                      .toLocaleString('en-CA', { maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">
                    Total Income Tax (Box 20)
                  </Typography>
                  <Typography variant="h6">
                    $
                    {t4Records
                      .reduce((sum, r) => sum + r.box20, 0)
                      .toLocaleString('en-CA', { maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">
                    Total EI Premiums (Box 23)
                  </Typography>
                  <Typography variant="h6">
                    $
                    {t4Records
                      .reduce((sum, r) => sum + r.box23, 0)
                      .toLocaleString('en-CA', { maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Employee Records
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Employee</TableCell>
                    <TableCell align="right">Employment Income</TableCell>
                    <TableCell align="right">Federal Tax</TableCell>
                    <TableCell align="right">EI Premiums</TableCell>
                    <TableCell align="right">CPP Contributions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {t4Records.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {record.firstName} {record.lastName}
                      </TableCell>
                      <TableCell align="right">
                        ${record.box14.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${record.box20.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${record.box23.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${record.box26.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleValidateRecords}
                fullWidth
              >
                Validate Records
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleExportXML}
                fullWidth
              >
                Export XML for CRA
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    </>
  );
}
