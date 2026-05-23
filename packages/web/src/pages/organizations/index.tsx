import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../../lib/api';

interface Organization {
  id: string;
  name: string;
  province: string;
  businessNumber: string;
  createdAt: string;
}

export default function Organizations() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organizations?page=1&limit=50');
      setOrganizations(response.data.data);
    } catch (err) {
      setError('Failed to fetch organizations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      try {
        await api.delete(`/organizations/${id}`);
        setOrganizations(organizations.filter((org) => org.id !== id));
      } catch (err) {
        setError('Failed to delete organization');
      }
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Organizations
          </Typography>
          <Link href="/">
            <Button color="inherit">Home</Button>
          </Link>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">All Organizations</Typography>
          <Link href="/organizations/new">
            <Button variant="contained" color="primary">
              New Organization
            </Button>
          </Link>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Province</TableCell>
                  <TableCell>Business Number</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {organizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No organizations found. Create one to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>{org.name}</TableCell>
                      <TableCell>{org.province}</TableCell>
                      <TableCell>{org.businessNumber || '-'}</TableCell>
                      <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Link href={`/organizations/${org.id}`}>
                          <Button size="small" variant="text">
                            View
                          </Button>
                        </Link>
                        <Button
                          size="small"
                          variant="text"
                          color="error"
                          onClick={() => handleDelete(org.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  );
}
