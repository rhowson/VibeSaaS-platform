'use client';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useRouter } from 'next/navigation';

// project-imports
import EcommerceDataCard from '@/components/cards/statistics/EcommerceDataCard';
import { GRID_COMMON_SPACING } from '@/config';

import WelcomeBanner from '@/sections/dashboard/default/WelcomeBanner';
import ProjectRelease from '@/sections/dashboard/default/ProjectRelease';
import EcommerceDataChart from '@/sections/widget/chart/EcommerceDataChart';
import TotalIncome from '@/sections/widget/chart/TotalIncome';
import RepeatCustomerRate from '@/sections/widget/chart/RepeatCustomerRate';
import ProjectOverview from '@/sections/widget/chart/ProjectOverview';
import Transactions from '@/sections/widget/data/Transactions';
import AssignUsers from '@/sections/widget/statistics/AssignUsers';

// assets
import { ArrowDown, ArrowUp, Book, Calendar, CloudChange, Wallet3, Add, Folder, Users, Settings } from '@wandersonalwes/iconsax-react';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={12}>
        <WelcomeBanner />
      </Grid>
      
      {/* Quick Actions */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => router.push('/projects/create')}
              >
                Create New Project
              </Button>
              <Button
                variant="outlined"
                startIcon={<Folder />}
                onClick={() => router.push('/projects')}
              >
                View All Projects
              </Button>
              <Button
                variant="outlined"
                startIcon={<Users />}
                onClick={() => router.push('/team')}
              >
                Manage Team
              </Button>
              <Button
                variant="outlined"
                startIcon={<Settings />}
                onClick={() => router.push('/settings')}
              >
                Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* row 1 - Statistics */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <EcommerceDataCard
          title="Team Members"
          count="8"
          color="warning"
          iconPrimary={<Users />}
          percentage={
            <Typography sx={{ color: 'warning.dark', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ArrowUp size={16} style={{ transform: 'rotate(45deg)' }} /> 12.5%
            </Typography>
          }
        >
          <EcommerceDataChart color={theme.palette.warning.dark} />
        </EcommerceDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
      </Grid>
      
      {/* row 2 */}
      <Grid size={{ xs: 12, md: 8, lg: 9 }}>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={12}>
            <RepeatCustomerRate />
          </Grid>
          <Grid size={12}>
            <ProjectOverview />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 4, lg: 3 }}>
        <Stack sx={{ gap: GRID_COMMON_SPACING }}>
          <ProjectRelease />
          <AssignUsers />
        </Stack>
      </Grid>
      
      {/* row 3 */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Transactions />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TotalIncome />
      </Grid>
    </Grid>
  );
}
