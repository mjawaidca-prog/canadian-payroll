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
import api from '../../../../lib/api';

export default function NewEmployee() {
  const router = useRouter();
  const { organizationId } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    sin: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
    province: '',
    employmentType: 'full_time',
    salaryAnnual: '',
    hireDate: '',
    federalTaxExemptions: '1',
    provincialTaxExemptions: '1',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const required = ['firstName', 'lastName', 'sin', 'dateOfBirth', 'hireDate'];
    const missing = required.filter((field) => !formData[field as keyof typeof formData]);

    if (missing.length > 0) {
      setError(`Missing required fields: ${missing.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      await api.post(`/organizations/${organizationId}/employees`, {
        ...formData,
        salaryAnnual: formData.salaryAnnual ? parseInt(formData.salaryAnnual) : undefined,
        federalTaxExemptions: parseInt(formData.federalTaxExemptions),
        provincialTaxExemptions: parseInt(formData.provincialTaxExemptions),
      });
      router.push(`/organizations/${organizationId}/employees`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Add Employee
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Create New Employee
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Enter employee details for payroll setup
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Personal Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Social Insurance Number (SIN)"
                  name="sin"
                  value={formData.sin}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="000000000"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  placeholder="john@example.com"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  placeholder="416-555-0100"
                />
              </Grid>
            </Grid>

            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              placeholder="123 Main Street"
            />

            <Typography variant="h6" sx={{ mt: 2 }}>
              Employment Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Employment Type"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  fullWidth
                  select
                  SelectProps={{ native: true }}
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="seasonal">Seasonal</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  fullWidth
                  select
                  SelectProps={{ native: true }}
                >
                  <option value="">Select Province</option>
                  <option value="ON">Ontario</option>
                  <option value="BC">British Columbia</option>
                  <option value="AB">Alberta</option>
                  <option value="MB">Manitoba</option>
                  <option value="SK">Saskatchewan</option>
                  <option value="QC">Quebec</option>
                  <option value="NS">Nova Scotia</option>
                  <option value="NB">New Brunswick</option>
                  <option value="NL">Newfoundland & Labrador</option>
                  <option value="PE">Prince Edward Island</option>
                  <option value="NT">Northwest Territories</option>
                  <option value="NU">Nunavut</option>
                  <option value="YT">Yukon</option>
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Annual Salary"
                  name="salaryAnnual"
                  type="number"
                  value={formData.salaryAnnual}
                  onChange={handleChange}
                  fullWidth
                  placeholder="50000"
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hire Date"
                  name="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Tax Settings
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Federal Tax Exemptions"
                  name="federalTaxExemptions"
                  type="number"
                  value={formData.federalTaxExemptions}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Provincial Tax Exemptions"
                  name="provincialTaxExemptions"
                  type="number"
                  value={formData.provincialTaxExemptions}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Employee'}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => router.push(`/organizations/${organizationId}/employees`)}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
