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
} from '@mui/material';
import { useRouter } from 'next/router';
import api from '../../lib/api';

export default function NewOrganization() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    province: 'ON',
    businessNumber: '',
    address: '',
    city: '',
    postalCode: '',
    contactEmail: '',
    contactPhone: '',
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

    if (!formData.name || !formData.province) {
      setError('Name and Province are required');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/organizations', formData);
      router.push(`/organizations/${response.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            New Organization
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Create New Organization
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Enter your company details to get started
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Organization Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              placeholder="e.g., Acme Corporation"
            />

            <TextField
              label="Province"
              name="province"
              value={formData.province}
              onChange={handleChange}
              fullWidth
              required
              select
              SelectProps={{ native: true }}
            >
              <option value="AB">Alberta</option>
              <option value="BC">British Columbia</option>
              <option value="MB">Manitoba</option>
              <option value="NB">New Brunswick</option>
              <option value="NL">Newfoundland & Labrador</option>
              <option value="NS">Nova Scotia</option>
              <option value="NT">Northwest Territories</option>
              <option value="NU">Nunavut</option>
              <option value="ON">Ontario</option>
              <option value="PE">Prince Edward Island</option>
              <option value="QC">Quebec</option>
              <option value="SK">Saskatchewan</option>
              <option value="YT">Yukon</option>
            </TextField>

            <TextField
              label="Business Number (CRA)"
              name="businessNumber"
              value={formData.businessNumber}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., 123456789RC0001"
            />

            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              placeholder="123 Main Street"
            />

            <TextField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              fullWidth
              placeholder="Toronto"
            />

            <TextField
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              fullWidth
              placeholder="M1A 1A1"
            />

            <TextField
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              fullWidth
              placeholder="hr@company.com"
            />

            <TextField
              label="Contact Phone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              fullWidth
              placeholder="416-555-0100"
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => router.push('/organizations')}
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
