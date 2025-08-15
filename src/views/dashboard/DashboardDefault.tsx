'use client';

import { memo, Suspense, lazy } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';

// Lazy load heavy components
const EcommerceDataCard = lazy(() => import('@/components/cards/statistics/EcommerceDataCard'));
const WelcomeBanner = lazy(() => import('@/sections/dashboard/default/WelcomeBanner'));
const ProjectRelease = lazy(() => import('@/sections/dashboard/default/ProjectRelease'));
const EcommerceDataChart = lazy(() => import('@/sections/widget/chart/EcommerceDataChart'));
const TotalIncome = lazy(() => import('@/sections/widget/chart/TotalIncome'));
const RepeatCustomerRate = lazy(() => import('@/sections/widget/chart/RepeatCustomerRate'));
const ProjectOverview = lazy(() => import('@/sections/widget/chart/ProjectOverview'));
const Transactions = lazy(() => import('@/sections/widget/data/Transactions'));
const AssignUsers = lazy(() => import('@/sections/widget/statistics/AssignUsers'));

import { GRID_COMMON_SPACING } from '@/config';

// assets
import {
  ArrowDown,
  ArrowUp,
  Book,
  Calendar,
  CloudChange,
  Wallet3,
  Add,
  Folder,
  Profile2User,
  Settings
} from '@wandersonalwes/iconsax-react';

// Loading component
const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" p={2}>
    <CircularProgress size={24} />
  </Box>
);

// ==============================|| DASHBOARD - DEFAULT ||============================== //

const DashboardDefault = memo(function DashboardDefault() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={12}>
        <Suspense fallback={<LoadingSpinner />}>
          <WelcomeBanner />
        </Suspense>
      </Grid>

      {/* Quick Actions */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/projects/create')}>
                Create New Project
              </Button>
              <Button variant="outlined" startIcon={<Folder />} onClick={() => router.push('/projects')}>
                View All Projects
              </Button>
              <Button variant="outlined" startIcon={<Profile2User />} onClick={() => router.push('/team')}>
                Manage Team
              </Button>
              <Button variant="outlined" startIcon={<Settings />} onClick={() => router.push('/settings')}>
                Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* row 1 - Statistics */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Suspense fallback={<LoadingSpinner />}>
          <EcommerceDataCard
            title="Active Projects"
            count="12"
            iconPrimary={<Folder />}
            percentage={
              <Typography color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowUp size={16} style={{ transform: 'rotate(45deg)' }} /> 15.3%
              </Typography>
            }
          >
            <EcommerceDataChart color={theme.palette.primary.main} />
          </EcommerceDataCard>
        </Suspense>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Suspense fallback={<LoadingSpinner />}>
          <EcommerceDataCard
            title="Team Members"
            count="8"
            color="warning"
            iconPrimary={<Profile2User />}
            percentage={
              <Typography sx={{ color: 'warning.dark', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowUp size={16} style={{ transform: 'rotate(45deg)' }} /> 12.5%
              </Typography>
            }
          >
            <EcommerceDataChart color={theme.palette.warning.dark} />
          </EcommerceDataCard>
        </Suspense>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Suspense fallback={<LoadingSpinner />}>
          <EcommerceDataCard
            title="Completed Tasks"
            count="1,568"
            color="success"
            iconPrimary={<Calendar />}
            percentage={
              <Typography sx={{ color: 'success.darker', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowUp size={16} style={{ transform: 'rotate(45deg)' }} /> 30.6%
              </Typography>
            }
          >
            <EcommerceDataChart color={theme.palette.success.darker} />
          </EcommerceDataCard>
        </Suspense>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Suspense fallback={<LoadingSpinner />}>
          <EcommerceDataCard
            title="AI Analysis"
            count="24"
            color="error"
            iconPrimary={<CloudChange />}
            percentage={
              <Typography sx={{ color: 'error.dark', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowUp size={16} style={{ transform: 'rotate(45deg)' }} /> 45.2%
              </Typography>
            }
          >
            <EcommerceDataChart color={theme.palette.error.dark} />
          </EcommerceDataCard>
        </Suspense>
      </Grid>

      {/* row 2 */}
      <Grid size={{ xs: 12, md: 8, lg: 9 }}>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={12}>
            <Suspense fallback={<LoadingSpinner />}>
              <RepeatCustomerRate />
            </Suspense>
          </Grid>
          <Grid size={12}>
            <Suspense fallback={<LoadingSpinner />}>
              <ProjectOverview />
            </Suspense>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 4, lg: 3 }}>
        <Stack sx={{ gap: GRID_COMMON_SPACING }}>
          <Suspense fallback={<LoadingSpinner />}>
            <ProjectRelease />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <AssignUsers />
          </Suspense>
        </Stack>
      </Grid>

      {/* row 3 */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Transactions />
        </Suspense>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Suspense fallback={<LoadingSpinner />}>
          <TotalIncome />
        </Suspense>
      </Grid>
    </Grid>
  );
});

export default DashboardDefault;
