import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Snackbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  People as PeopleIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon,
} from '@mui/icons-material';
import userService, { User, UserStats } from '../services/userService';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { collection, writeBatch, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { saveAs } from 'file-saver';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    activeThisWeek: 0,
    unverifiedUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<Date | null>(null);
  const [filterDateTo, setFilterDateTo] = useState<Date | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState<'delete' | 'activate' | 'deactivate' | null>(null);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const users = await userService.getUsers();
      setUsers(users);
      const stats = await userService.getUserStats();
      setUserStats(stats);
      showSnackbar('Users loaded successfully!', 'success');
    } catch (error) {
      console.error('Error loading users:', error);
      showSnackbar('Error loading users. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const safeDisplayName = (user.displayName || '').toLowerCase();
    const safeEmail = (user.email || '').toLowerCase();
    const safeSearch = (searchTerm || '').toLowerCase().trim();
    const matchesSearch =
      safeDisplayName.includes(safeSearch) ||
      safeEmail.includes(safeSearch);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);
    const matchesVerified =
      filterVerified === 'all' ||
      (filterVerified === 'verified' && user.emailVerified) ||
      (filterVerified === 'unverified' && !user.emailVerified);
    const matchesProvider =
      filterProvider === 'all' ||
      user.providerData.includes(filterProvider);
    const joinedDate = user.createdAt ? new Date(user.createdAt) : null;
    const matchesDateFrom = !filterDateFrom || (joinedDate && joinedDate >= filterDateFrom);
    const matchesDateTo = !filterDateTo || (joinedDate && joinedDate <= filterDateTo);
    return (
      matchesSearch &&
      matchesStatus &&
      matchesVerified &&
      matchesProvider &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleSelectUser = (uid: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(filteredUsers.map((user) => user.uid));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleBulkAction = (action: 'delete' | 'activate' | 'deactivate') => {
    setConfirmDialogAction(action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmBulkAction = async () => {
    setConfirmDialogOpen(false);
    if (!confirmDialogAction || selectedUserIds.length === 0) return;
    try {
      if (confirmDialogAction === 'delete') {
        const batch = writeBatch(db);
        selectedUserIds.forEach((uid) => {
          batch.delete(doc(db, 'users', uid));
        });
        await batch.commit();
        showSnackbar('Selected users deleted.', 'success');
      } else {
        const batch = writeBatch(db);
        selectedUserIds.forEach((uid) => {
          batch.update(doc(db, 'users', uid), {
            isActive: confirmDialogAction === 'activate',
          });
        });
        await batch.commit();
        showSnackbar(
          confirmDialogAction === 'activate'
            ? 'Selected users activated.'
            : 'Selected users deactivated.',
          'success'
        );
      }
      setSelectedUserIds([]);
      loadUsers();
    } catch (error) {
      showSnackbar('Bulk action failed. Please try again.', 'error');
    }
  };

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      showSnackbar('No users to export.', 'info');
      return;
    }
    const headers = [
      'UID',
      'Display Name',
      'Email',
      'Email Verified',
      'Provider',
      'Active',
      'Joined',
      'Last Sign In',
      'Last Activity',
      'Photo URL',
    ];
    const rows = filteredUsers.map((user) => [
      user.uid,
      user.displayName,
      user.email,
      user.emailVerified ? 'Yes' : 'No',
      user.providerData.join(','),
      user.isActive ? 'Active' : 'Inactive',
      user.createdAt ? formatDate(user.createdAt) : '',
      user.lastSignInAt ? formatDate(user.lastSignInAt) : '',
      user.lastActivity ? formatDate(user.lastActivity) : '',
      user.photoURL || '',
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const formatDate = (date: Date | string | number | null | undefined) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getProviderIconAndLabel = (providerData: string[]) => {
    if (providerData.includes('google.com')) return { icon: <GoogleIcon sx={{ color: '#4285F4', fontSize: 20, mr: 0.5 }} />, label: 'Google' };
    if (providerData.includes('facebook.com')) return { icon: <FacebookIcon sx={{ color: '#1877F3', fontSize: 20, mr: 0.5 }} />, label: 'Facebook' };
    if (providerData.includes('apple.com')) return { icon: <AppleIcon sx={{ color: '#111', fontSize: 20, mr: 0.5 }} />, label: 'Apple' };
    if (providerData.includes('password')) return { icon: <EmailIcon sx={{ color: '#6B7280', fontSize: 20, mr: 0.5 }} />, label: 'Email/Password' };
    return { icon: null, label: providerData[0] || 'Unknown' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, width: '100%' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
          }}
        >
          Users
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
          }}
        >
          Manage users who signed up through Google sign-in
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <PeopleIcon />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {userStats.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <VerifiedIcon />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {userStats.verifiedUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <CalendarIcon />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {userStats.activeThisWeek}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active This Week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <EmailIcon />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {userStats.unverifiedUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unverified Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Controls */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Email Verified"
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Provider"
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="all">All</option>
                <option value="google.com">Google</option>
                <option value="facebook.com">Facebook</option>
                <option value="apple.com">Apple</option>
                <option value="password">Email/Password</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Joined From"
                  value={filterDateFrom}
                  onChange={setFilterDateFrom}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Joined To"
                  value={filterDateTo}
                  onChange={setFilterDateTo}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={12} sx={{ mt: { xs: 2, md: 0 } }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterVerified('all');
                  setFilterProvider('all');
                  setFilterDateFrom(null);
                  setFilterDateTo(null);
                }}
                sx={{ minWidth: 120 }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Search and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, minWidth: 250 }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadUsers}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Export Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" onClick={handleExportCSV}>
          Export CSV
        </Button>
      </Box>

      {/* Bulk Actions Toolbar */}
      {selectedUserIds.length > 0 && (
        <Card sx={{ mb: 2, bgcolor: 'grey.100', border: '1px solid #E5E7EB' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedUserIds.length} selected
            </Typography>
            <Button
              color="error"
              variant="outlined"
              onClick={() => handleBulkAction('delete')}
            >
              Delete
            </Button>
            <Button
              color="success"
              variant="outlined"
              onClick={() => handleBulkAction('activate')}
            >
              Activate
            </Button>
            <Button
              color="warning"
              variant="outlined"
              onClick={() => handleBulkAction('deactivate')}
            >
              Deactivate
            </Button>
            <Button
              variant="text"
              onClick={() => setSelectedUserIds([])}
            >
              Clear
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={
                        selectedUserIds.length > 0 &&
                        selectedUserIds.length === filteredUsers.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length;
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Provider</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Last Sign In</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Last Activity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid} hover selected={selectedUserIds.includes(user.uid)}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.uid)}
                        onChange={() => handleSelectUser(user.uid)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={user.photoURL}
                          sx={{ width: 40, height: 40 }}
                        >
                          {user.displayName?.charAt(0) || user.email?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.displayName || 'No Name'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            ID: {user.uid}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const { icon, label } = getProviderIconAndLabel(user.providerData);
                        return (
                          <Chip
                            icon={icon || undefined}
                            label={label}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ pl: icon ? 0 : 1 }}
                          />
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.emailVerified ? 'Verified' : 'Unverified'}
                        size="small"
                        color={user.emailVerified ? 'success' : 'warning'}
                        icon={user.emailVerified ? <VerifiedIcon /> : <BlockIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={user.isActive ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(user.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(user.lastSignInAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(user.lastActivity)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewUser(user)}
                          sx={{ color: 'primary.main' }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredUsers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {searchTerm ? 'No users found matching your search.' : 'No users found.'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedUser.photoURL}
                  sx={{ width: 48, height: 48 }}
                >
                  {selectedUser.displayName?.charAt(0) || selectedUser.email?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedUser.displayName || 'No Name'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: 'grey.100', p: 1, borderRadius: 1 }}>
                    {selectedUser.uid}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email Verification
                  </Typography>
                  <Chip
                    label={selectedUser.emailVerified ? 'Verified' : 'Unverified'}
                    color={selectedUser.emailVerified ? 'success' : 'warning'}
                    icon={selectedUser.emailVerified ? <VerifiedIcon /> : <BlockIcon />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sign-in Provider
                  </Typography>
                  {(() => {
                    const { icon, label } = getProviderIconAndLabel(selectedUser.providerData);
                    return (
                      <Chip
                        label={label}
                        color="primary"
                        variant="outlined"
                        icon={icon || undefined}
                      />
                    );
                  })()}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Account Status
                  </Typography>
                  <Chip
                    label={selectedUser.isActive ? 'Active' : 'Inactive'}
                    color={selectedUser.isActive ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Account Created
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedUser.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Sign In
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedUser.lastSignInAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Activity
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedUser.lastActivity)}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUserDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Confirm Bulk Action Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Bulk Action</DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialogAction === 'delete' &&
              `Are you sure you want to delete ${selectedUserIds.length} user(s)? This action cannot be undone.`}
            {confirmDialogAction === 'activate' &&
              `Are you sure you want to activate ${selectedUserIds.length} user(s)?`}
            {confirmDialogAction === 'deactivate' &&
              `Are you sure you want to deactivate ${selectedUserIds.length} user(s)?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmBulkAction}
            color={confirmDialogAction === 'delete' ? 'error' : confirmDialogAction === 'activate' ? 'success' : 'warning'}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users; 