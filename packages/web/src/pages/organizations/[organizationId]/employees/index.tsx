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
  Chip,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../../../lib/api';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  employmentType: string;
  salaryAnnual: number;
  isActive: boolean;
  createdAt: string;
}

export default function Employees() {
  const router = useRouter();
  const { organizationId } = router.query;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (organizationId) {
      fetchEmployees();
    }
  }, [organizationId]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/organizations/${organizationId}/employees?page=1&limit=100`
      );
      setEmployees(response.data.data);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (employeeId: string) => {
    if (confirm('Deactivate this employee?')) {
      try {
        await api.post(
          `/organizations/${organizationId}/employees/${employeeId}/deactivate`
        );
        fetchEmployees();
      } catch (err) {
        setError('Failed to deactivate employee');
      }
    }
  };

  const handleReactivate = async (employeeId: string) => {
    if (confirm('Reactivate this employee?')) {
      try {
        await api.post(
          `/organizations/${organizationId}/employees/${employeeId}/reactivate`
        );
        fetchEmployees();
      } catch (err) {
        setError('Failed to reactivate employee');
      }
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Employees
          </Typography>
          <Link href="/">
            <Button color="inherit">Home</Button>
          </Link>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Employee List</Typography>
          <Link href={`/organizations/${organizationId}/employees/new`}>
            <Button variant="contained" color="primary">
              Add Employee
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
                  <TableCell>Email</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No employees found. Add one to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.fullName}</TableCell>
                      <TableCell>{emp.email || '-'}</TableCell>
                      <TableCell>{emp.employmentType}</TableCell>
                      <TableCell>
                        ${emp.salaryAnnual?.toLocaleString() || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={emp.isActive ? 'Active' : 'Inactive'}
                          color={emp.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Link href={`/organizations/${organizationId}/employees/${emp.id}`}>
                          <Button size="small" variant="text">
                            View
                          </Button>
                        </Link>
                        {emp.isActive ? (
                          <Button
                            size="small"
                            variant="text"
                            color="warning"
                            onClick={() => handleDeactivate(emp.id)}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="text"
                            color="success"
                            onClick={() => handleReactivate(emp.id)}
                          >
                            Reactivate
                          </Button>
                        )}
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
