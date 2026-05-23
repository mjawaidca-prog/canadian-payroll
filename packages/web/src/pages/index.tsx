import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleNewOrganization = () => {
    router.push('/organizations/new');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Canadian Payroll System
          </Typography>
          <Button color="inherit" href="/settings">
            Settings
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome to the Canadian Payroll Management System
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Organizations
                </Typography>
                <Typography variant="h5">0</Typography>
                <Typography color="textSecondary">Active</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Employees
                </Typography>
                <Typography variant="h5">0</Typography>
                <Typography color="textSecondary">Total</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pay Runs
                </Typography>
                <Typography variant="h5">0</Typography>
                <Typography color="textSecondary">This Month</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pay Stubs
                </Typography>
                <Typography variant="h5">0</Typography>
                <Typography color="textSecondary">Generated</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNewOrganization}
            sx={{ mr: 2 }}
          >
            New Organization
          </Button>
          <Link href="/organizations">
            <Button variant="outlined" color="primary">
              View All Organizations
            </Button>
          </Link>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Link href="/organizations">
                    <Button variant="text">Manage Organizations</Button>
                  </Link>
                  <Link href="/employees">
                    <Button variant="text">Manage Employees</Button>
                  </Link>
                  <Link href="/payroll">
                    <Button variant="text">Process Payroll</Button>
                  </Link>
                  <Link href="/reports">
                    <Button variant="text">View Reports</Button>
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Documentation
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Learn more about the Canadian Payroll System:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <a href="/docs/API.md" target="_blank" rel="noopener noreferrer">
                    <Button variant="text">API Documentation</Button>
                  </a>
                  <a href="/docs/INSTALLATION.md" target="_blank" rel="noopener noreferrer">
                    <Button variant="text">Installation Guide</Button>
                  </a>
                  <a href="/docs/TAX_CALCULATION_GUIDE.md" target="_blank" rel="noopener noreferrer">
                    <Button variant="text">Tax Calculation Guide</Button>
                  </a>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
