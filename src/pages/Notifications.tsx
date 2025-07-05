import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Notifications: React.FC = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [launchUrl, setLaunchUrl] = useState('');
  const [image, setImage] = useState('');
  const [smallIcon, setSmallIcon] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [loading, setLoading] = useState(false);
  // Config state
  const [oneSignalAppId, setOneSignalAppId] = useState('');
  const [oneSignalRestApiKey, setOneSignalRestApiKey] = useState('');
  const [configLoading, setConfigLoading] = useState(true);
  // Stats state
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [oneSignalStats, setOneSignalStats] = useState<any>(null);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  // Chart data
  const [userActivityData, setUserActivityData] = useState<any[]>([]);
  const [notificationTrends, setNotificationTrends] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Helper: Aggregate user activity for last 7 days
  const computeUserActivityData = (users: any[]) => {
    const days: { [date: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[key] = 0;
    }
    users.forEach(user => {
      if (user.lastActivity) {
        const d = user.lastActivity.toDate ? user.lastActivity.toDate() : new Date(user.lastActivity);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (days[key] !== undefined) days[key]++;
      }
    });
    setUserActivityData(Object.entries(days).map(([date, activeUsers]) => ({ date, activeUsers })));
  };

  // Helper: Compute notification trends and engagement from real notifications
  const computeNotificationCharts = (notifications: any[]) => {
    // Debug: Log the OneSignal API response
    console.log('OneSignal notifications API response:', notifications);
    // Bar chart: delivered, clicked, errors for each notification
    const trends = notifications.map((n, idx) => ({
      notification: n.headings?.en ? n.headings.en.slice(0, 12) : `Notif ${idx + 1}`,
      delivered: n.success || 0,
      clicked: n.clicked || 0,
      errors: n.errors ? (Array.isArray(n.errors) ? n.errors.length : 1) : 0,
    }));
    setNotificationTrends(trends);
    // Pie chart: sum delivered, clicked, errors
    const totalDelivered = trends.reduce((sum, item) => sum + item.delivered, 0);
    const totalClicked = trends.reduce((sum, item) => sum + item.clicked, 0);
    const totalErrors = trends.reduce((sum, item) => sum + item.errors, 0);
    setEngagementData([
      { name: 'Delivered', value: totalDelivered, color: '#0088FE' },
      { name: 'Clicked', value: totalClicked, color: '#00C49F' },
      { name: 'Errors', value: totalErrors, color: '#FF8042' },
    ]);
  };

  // Helper: Fetch recent notifications and update state/charts
  const fetchRecentNotifications = async (appId: string, restKey: string, showSnackbar = false) => {
    setRefreshing(true);
    try {
      const notifRes = await fetch(`https://onesignal.com/api/v1/notifications?app_id=${appId}&limit=10`, {
        headers: { Authorization: `Basic ${restKey}` },
      });
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setRecentNotifications(notifData.notifications || []);
        computeNotificationCharts(notifData.notifications || []);
        if (showSnackbar) setSnackbar({ open: true, message: 'Notifications refreshed.', severity: 'success' });
      } else {
        setRecentNotifications([]);
        setNotificationTrends([]);
        setEngagementData([]);
        if (showSnackbar) setSnackbar({ open: true, message: 'Failed to refresh notifications.', severity: 'error' });
      }
    } catch (err) {
      setRecentNotifications([]);
      setNotificationTrends([]);
      setEngagementData([]);
      if (showSnackbar) setSnackbar({ open: true, message: 'Failed to refresh notifications.', severity: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh notifications every 15 seconds
  useEffect(() => {
    if (!oneSignalAppId || !oneSignalRestApiKey) return;
    const interval = setInterval(() => {
      fetchRecentNotifications(oneSignalAppId, oneSignalRestApiKey);
    }, 15000);
    return () => clearInterval(interval);
  }, [oneSignalAppId, oneSignalRestApiKey]);

  // Fetch config and stats
  useEffect(() => {
    const fetchConfigAndStats = async () => {
      setConfigLoading(true);
      setStatsLoading(true);
      try {
        // Fetch OneSignal config
        const configRef = doc(db, 'app_config', 'main_config');
        const configSnap = await getDoc(configRef);
        let appId = '';
        let restKey = '';
        if (configSnap.exists()) {
          const data = configSnap.data();
          appId = data.oneSignalAppId || '';
          restKey = data.oneSignalRestApiKey || '';
          setOneSignalAppId(appId);
          setOneSignalRestApiKey(restKey);
        }
        setConfigLoading(false);

        // Fetch Firestore user stats
        let usersArr: any[] = [];
        try {
          const usersSnap = await getDocs(collection(db, 'users'));
          const now = new Date();
          let active = 0;
          let total = 0;
          usersSnap.forEach(doc => {
            const data = doc.data();
            usersArr.push(data);
            total++;
            if (data.lastActivity) {
              const last = data.lastActivity.toDate ? data.lastActivity.toDate() : new Date(data.lastActivity);
              if (now.getTime() - last.getTime() <= ONE_WEEK_MS) active++;
            }
          });
          setActiveUsers(active);
          setTotalSubscribers(total);
          computeUserActivityData(usersArr);
        } catch (userError) {
          console.log('User stats error:', userError);
          // Continue with default values
          setUserActivityData([]);
        }

        // Fetch OneSignal stats and recent notifications (optional)
        if (appId && restKey) {
          try {
            // App stats
            const appRes = await fetch(`https://onesignal.com/api/v1/apps/${appId}`, {
              headers: { Authorization: `Basic ${restKey}` },
            });
            if (appRes.ok) {
              const appData = await appRes.json();
              setOneSignalStats(appData);
            }
            // Recent notifications
            await fetchRecentNotifications(appId, restKey);
          } catch (oneSignalError) {
            console.log('OneSignal API error:', oneSignalError);
            setNotificationTrends([]);
            setEngagementData([]);
          }
        } else {
          setNotificationTrends([]);
          setEngagementData([]);
        }
      } catch (error) {
        console.error('Config/stats error:', error);
        setSnackbar({ open: true, message: 'Some data failed to load, but the page is functional.', severity: 'warning' });
        setUserActivityData([]);
        setNotificationTrends([]);
        setEngagementData([]);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchConfigAndStats();
  }, []);

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oneSignalAppId || !oneSignalRestApiKey) {
      setSnackbar({ open: true, message: 'OneSignal App ID or REST API Key missing.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        app_id: oneSignalAppId,
        headings: { en: title },
        contents: { en: message },
        included_segments: ['All'],
      };
      if (launchUrl) payload.url = launchUrl;
      if (image) payload.big_picture = image;
      if (smallIcon) payload.small_icon = smallIcon;
      // Send notification
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${oneSignalRestApiKey}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      setSnackbar({ open: true, message: 'Notification sent successfully!', severity: 'success' });
      setTitle(''); setMessage(''); setLaunchUrl(''); setImage(''); setSmallIcon('');
      // Re-fetch recent notifications after sending
      await fetchRecentNotifications(oneSignalAppId, oneSignalRestApiKey);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to send notification.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Helper for OneSignal stats
  const getStat = (key: string, fallback = '-') =>
    oneSignalStats && oneSignalStats[key] !== undefined ? oneSignalStats[key] : fallback;

  // Only show the 5 most recent notifications
  const displayedNotifications = recentNotifications.slice(0, 5);

  // Click-to-fill handler
  const handleNotificationRowClick = (notif: any) => {
    setTitle(notif.headings?.en || '');
    setMessage(notif.contents?.en || '');
    setImage(notif.big_picture || '');
    setLaunchUrl(notif.url || '');
    setSmallIcon(notif.small_icon || '');
    setSnackbar({ open: true, message: 'Notification loaded into form.', severity: 'info' });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Active Users (7d)</Typography>
              <Typography variant="h4" fontWeight={700}>{statsLoading ? <CircularProgress size={24} /> : activeUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Subscribers</Typography>
              <Typography variant="h4" fontWeight={700}>{statsLoading ? <CircularProgress size={24} /> : totalSubscribers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Delivered</Typography>
              <Typography variant="h4" fontWeight={700}>{getStat('messages_delivered')}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Unsubscribed</Typography>
              <Typography variant="h4" fontWeight={700}>{getStat('users_unsubscribed')}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* User Activity Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Daily Active Users</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Engagement Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700} mr={1}>Notification Engagement</Typography>
                <Tooltip title="No data will show unless notifications are delivered and clicked. This is common if you have no active subscribers or are testing.">
                  <InfoOutlinedIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              {engagementData.every(d => !d.value) ? (
                <Box height={250} display="flex" alignItems="center" justifyContent="center" color="text.secondary">
                  No data available
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={engagementData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Performance Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700} mr={1}>Recent Notification Performance</Typography>
                <Tooltip title="No data will show unless notifications are delivered and clicked. This is common if you have no active subscribers or are testing.">
                  <InfoOutlinedIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              {notificationTrends.every(t => !t.delivered && !t.clicked && !t.errors) ? (
                <Box height={250} display="flex" alignItems="center" justifyContent="center" color="text.secondary">
                  No data available
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={notificationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="notification" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="delivered" fill="#0088FE" />
                    <Bar dataKey="clicked" fill="#00C49F" />
                    <Bar dataKey="errors" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Notifications Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight={700}>Recent Notifications</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => fetchRecentNotifications(oneSignalAppId, oneSignalRestApiKey, true)}
              disabled={refreshing || !oneSignalAppId || !oneSignalRestApiKey}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Sent At</TableCell>
                  <TableCell>Delivered</TableCell>
                  <TableCell>Clicked</TableCell>
                  <TableCell>Errors</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedNotifications.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">No notifications found.</TableCell></TableRow>
                ) : displayedNotifications.map((n) => (
                  <TableRow
                    key={n.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleNotificationRowClick(n)}
                  >
                    <TableCell>{n.headings?.en || '-'}</TableCell>
                    <TableCell>{n.contents?.en || '-'}</TableCell>
                    <TableCell>{n.completed_at ? new Date(n.completed_at * 1000).toLocaleString() : '-'}</TableCell>
                    <TableCell>{n.success || '-'}</TableCell>
                    <TableCell>{n.clicked || '-'}</TableCell>
                    <TableCell>{n.errors ? JSON.stringify(n.errors) : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Notification Form */}
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={2}>
            Send Notification
          </Typography>
          {configLoading ? (
            <Typography>Loading OneSignal config...</Typography>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    fullWidth
                    placeholder="Title (Any/English)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    fullWidth
                    required
                    multiline
                    minRows={2}
                    placeholder="Message (Any/English)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Image"
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    fullWidth
                    placeholder="Upload or input url"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Launch URL"
                    value={launchUrl}
                    onChange={e => setLaunchUrl(e.target.value)}
                    fullWidth
                    placeholder="http://bit.ly/abc"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Small Icon"
                    value={smallIcon}
                    onChange={e => setSmallIcon(e.target.value)}
                    fullWidth
                    placeholder="Upload or input url"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? 'Sending...' : 'Send Notification'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Notifications; 