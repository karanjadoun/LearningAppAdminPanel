import React, { useRef, useState } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  InputBase,
  Avatar,
  Tooltip,
  useMediaQuery,
  ClickAwayListener,
} from '@mui/material';
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { useSearch } from '../../contexts/SearchContext';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchResults from '../Search/SearchResults';

interface AppBarProps {
  onMenuClick: () => void;
}

const AppBar: React.FC<AppBarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { config } = useAppConfig();
  const { searchQuery, setSearchQuery, clearSearch, showSearchResults } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:1024px)');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Welcome back! Here\'s what\'s happening with your learning content.',
        };
      case '/content':
        return {
          title: 'Content Management',
          subtitle: 'Create and organize your learning content',
        };
      case '/analytics':
        return {
          title: 'Analytics',
          subtitle: 'Track your content performance and user engagement',
        };
      case '/settings':
        return {
          title: 'Settings',
          subtitle: 'Manage your preferences and configurations',
        };
      case '/advanced-settings':
        return {
          title: 'Advanced Settings',
          subtitle: 'Manage Firebase, database, and system configurations',
        };
      default:
        return {
          title: `${config.appName} ${config.appTitle}`,
          subtitle: config.appDescription,
        };
    }
  };

  const { title, subtitle } = getPageTitle();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchClear = () => {
    clearSearch();
    setSearchFocused(false);
  };

  const handleClickAway = () => {
    setSearchFocused(false);
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
  };

  const handleMobileSearchToggle = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (mobileSearchOpen) {
      clearSearch();
    }
  };

  const handleSearchResultClick = () => {
    setSearchFocused(false);
    setMobileSearchOpen(false);
  };

  return (
    <MuiAppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid #f1f5f9',
        color: 'text.primary',
        width: '100%',
      }}
    >
      <Toolbar
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1,
          minHeight: { xs: 64, sm: 72 } + '!important',
        }}
      >
        {/* Menu Button for Mobile */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{
            mr: 2,
            display: { lg: isMobile ? 'block' : 'none' },
            p: 1,
            '&:hover': {
              backgroundColor: 'grey.100',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page Title Section */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              color: 'text.primary',
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        {/* Search Bar */}
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box
            ref={searchRef}
            sx={{
              display: { xs: 'none', md: 'flex' },
              position: 'relative',
              alignItems: 'center',
              backgroundColor: searchFocused ? 'background.paper' : 'grey.100',
              borderRadius: 3,
              px: 2,
              py: 1,
              minWidth: 300,
              mr: 3,
              border: searchFocused ? '2px solid #6366f1' : '1px solid transparent',
              '&:hover': {
                backgroundColor: searchFocused ? 'background.paper' : 'grey.200',
              },
              transition: 'all 0.2s ease-in-out',
              boxShadow: searchFocused ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none',
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            <InputBase
              placeholder="Search content..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              sx={{
                flex: 1,
                fontSize: '0.875rem',
                '& input': {
                  padding: 0,
                  '&::placeholder': {
                    color: 'text.secondary',
                    opacity: 1,
                  },
                },
              }}
            />
            {searchQuery && (
              <IconButton
                size="small"
                onClick={handleSearchClear}
                sx={{
                  p: 0.5,
                  ml: 1,
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'grey.200',
                  },
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
            
            {/* Search Results Dropdown */}
            {(searchFocused || showSearchResults) && (
              <SearchResults
                onResultClick={handleSearchResultClick}
                onClose={handleClickAway}
              />
            )}
          </Box>
        </ClickAwayListener>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Search Button for Mobile */}
          <IconButton
            onClick={handleMobileSearchToggle}
            sx={{
              display: { xs: 'block', md: 'none' },
              color: mobileSearchOpen ? 'primary.main' : 'text.secondary',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          >
            {mobileSearchOpen ? <ClearIcon /> : <SearchIcon />}
          </IconButton>

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton
              onClick={() => navigate('/settings')}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 2,
              ml: 2,
              pl: 2,
              borderLeft: '1px solid #f1f5f9',
            }}
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                {user?.displayName?.split(' ')[0] || 'Karan Jadoun'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                }}
              >
                Administrator
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: 'primary.main',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                },
                transition: 'box-shadow 0.2s ease-in-out',
              }}
            >
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'K'}
            </Avatar>
          </Box>

          {/* Mobile User Avatar */}
          <Avatar
            sx={{
              display: { xs: 'block', sm: 'none' },
              width: 36,
              height: 36,
              backgroundColor: 'primary.main',
              fontSize: '0.875rem',
              fontWeight: 600,
              ml: 1,
            }}
          >
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'K'}
          </Avatar>
        </Box>
      </Toolbar>
      
      {/* Mobile Search Bar */}
      {mobileSearchOpen && (
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            borderTop: '1px solid #f1f5f9',
            backgroundColor: 'background.paper',
            px: 2,
            py: 1.5,
            position: 'relative',
          }}
        >
          <ClickAwayListener onClickAway={() => setMobileSearchOpen(false)}>
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'grey.100',
                  borderRadius: 3,
                  px: 2,
                  py: 1,
                  border: '1px solid transparent',
                  '&:focus-within': {
                    backgroundColor: 'background.paper',
                    border: '2px solid #6366f1',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                <InputBase
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoFocus
                  sx={{
                    flex: 1,
                    fontSize: '0.875rem',
                    '& input': {
                      padding: 0,
                      '&::placeholder': {
                        color: 'text.secondary',
                        opacity: 1,
                      },
                    },
                  }}
                />
                {searchQuery && (
                  <IconButton
                    size="small"
                    onClick={handleSearchClear}
                    sx={{
                      p: 0.5,
                      ml: 1,
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: 'grey.200',
                      },
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              
              {/* Mobile Search Results */}
              {showSearchResults && (
                              <SearchResults
                onResultClick={() => {
                  handleSearchResultClick();
                  setMobileSearchOpen(false);
                }}
                onClose={() => setMobileSearchOpen(false)}
              />
              )}
            </Box>
          </ClickAwayListener>
        </Box>
      )}
    </MuiAppBar>
  );
};

export default AppBar; 