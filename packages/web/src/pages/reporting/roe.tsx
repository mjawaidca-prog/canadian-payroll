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
} from '@mui/material';
import { useRouter } from 'next/router';
import api from '../../lib/api';

export default function GenerateROE() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roeData, setRoeData] = useState<any>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    reasonCode: 'B', // Default to dismissed
  });

  const reasonCodes = [
    { code: 'A', label: 'Quit' },
    { code: 'B', label: 'Dismissed' },
    { code: 'C', label: 'Laid Off - No Recall' },
    { code: 'D', label: 'Laid Off - With Recall' },
    { code: 'E', label: 'Hours Reduced to Zero' },
    { code: 'F', label: 'Illness or Injury' },
    { code: 'G', label: 'Maternity/Parental Leave' },
    { code: 'H', label: 'Retirement' },
    { code: 'I', label: 'Succession Planning' },
    { code: 'J', label: 'Business Closure or Bankruptcy' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateROE = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.employeeId) {
      setError('Employee ID is required');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/reporting/roe/generate/${formData.employeeId}`, {
        reasonCode: formData.reasonCode,
      });
      setRoeData(response.data.data);
      setSuccess('ROE generated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate ROE');
    } finally {
      setLoading(false);
    }
  };

  const handleExportXML = async () => {
    if (!roeData) {
      setError('No ROE data to export');
      return;
    }

    try {
      const response = await api.post('/reporting/roe/export-xml', { roe: roeData }, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `roe-${roeData.employeeId}.xml`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      setError('Failed to export XML');
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Generate Record of Employment (ROE)
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
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

          <Box component="form" onSubmit={handleGenerateROE}>
            <Typography variant="h6" gutterBottom>
              Employee Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  label="Employee ID"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Enter employee ID"
                  required
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>
              Termination Details
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Reason for Termination
                </Typography>
                <select
                  name="reasonCode"
                  value={formData.reasonCode}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  {reasonCodes.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code} - {item.label}
                    </option>
                  ))}
                </select>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ flex: 1 }}
              >
                {loading ? 'Generating...' : 'Generate ROE'}
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

          {roeData && (
            <Paper sx={{ p: 3, mt: 4, backgroundColor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom>
                Generated ROE Summary
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Employee Name</Typography>
                  <Typography variant="body2">
                    {roeData.firstName} {roeData.lastName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">SIN (Masked)</Typography>
                  <Typography variant="body2">***-***-{roeData.sin.slice(-4)}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Hire Date</Typography>
                  <Typography variant="body2">
                    {new Date(roeData.hireDate).toLocaleDateString()}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Termination Date</Typography>
                  <Typography variant="body2">
                    {new Date(roeData.terminationDate).toLocaleDateString()}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">YTD Insurable Earnings</Typography>
                  <Typography variant="body2">
                    ${roeData.ytdInsurableEarnings.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">YTD EI Premiums</Typography>
                  <Typography variant="body2">
                    ${roeData.ytdEIPremiums.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">YTD CPP Contributions</Typography>
                  <Typography variant="body2">
                    ${roeData.ytdCPPContributions.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Claim Code</Typography>
                  <Typography variant="body2">{roeData.claimCode}</Typography>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleExportXML}
                  fullWidth
                >
                  Export as XML
                </Button>
              </Box>
            </Paper>
          )}
        </Paper>
      </Container>
    </>
  );
}
