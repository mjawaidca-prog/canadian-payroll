import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/router';
import api from '../../lib/api';

export default function ReportingDashboard() {
  const router = useRouter();
  const [taxYear, setTaxYear] = useState<string>(new Date().getFullYear().toString());
  const [organizationId, setOrganizationId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleGenerateT4 = async () => {
    if (!organizationId) {
      setMessageType('error');
      setMessage('Please select an organization');
      return;
    }

    try {
      const response = await api.post(`/reporting/t4/generate/${organizationId}/${taxYear}`);
      setMessageType('success');
      setMessage(`Generated T4 records for ${response.data.data.length} employees`);
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.response?.data?.error || 'Failed to generate T4 records');
    }
  };

  const handleGenerateROE = async (employeeId: string) => {
    try {
      const response = await api.post(`/reporting/roe/generate/${employeeId}`);
      setMessageType('success');
      setMessage('ROE generated successfully');
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.response?.data?.error || 'Failed to generate ROE');
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tax Reporting (Phase 5)
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {message && (
          <Alert severity={messageType} sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* T4 Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  T4 Reporting
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Generate T4 records for CRA filing. Includes employment income, tax
                  deductions, and EI/CPP contributions.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Tax Year
                    </Typography>
                    <input
                      type="number"
                      value={taxYear}
                      onChange={(e) => setTaxYear(e.target.value)}
                      min="2020"
                      max={new Date().getFullYear()}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Organization
                    </Typography>
                    <input
                      type="text"
                      placeholder="Enter organization ID"
                      value={organizationId}
                      onChange={(e) => setOrganizationId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleGenerateT4}
                >
                  Generate T4 Records
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* ROE Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Record of Employment (ROE)
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Generate ROE documents for terminated employees. Required for EI claims.
                  Includes employment dates, reason for termination, and earnings.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2">
                    ROE Reason Codes:
                  </Typography>
                  <Typography variant="caption">
                    A: Quit | B: Dismissed | C: Laid Off (No Recall)
                  </Typography>
                  <Typography variant="caption">
                    D: Laid Off (Recall) | E: Hours Reduced | F: Illness
                  </Typography>
                  <Typography variant="caption">
                    G: Maternity Leave | H: Retirement | I: Succession
                  </Typography>
                  <Typography variant="caption">
                    J: Business Closure
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => router.push('/reporting/roe')}
                >
                  Generate ROE
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Features Grid */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Phase 5 Features
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="subtitle2">✓ T4 Generation</Typography>
                    <Typography variant="caption">
                      CRA-compliant T4 slips for all employees
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="subtitle2">✓ ROE Tracking</Typography>
                    <Typography variant="caption">
                      Employment Termination records with reason codes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="subtitle2">✓ XML Export</Typography>
                    <Typography variant="caption">
                      Ready for CRA NETFILE submission
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="subtitle2">✓ Validation</Typography>
                    <Typography variant="caption">
                      Automatic compliance checking
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
