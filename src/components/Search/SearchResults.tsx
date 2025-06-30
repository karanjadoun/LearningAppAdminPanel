import React from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  Button,
} from '@mui/material';
import {
  FolderOpen,
  Topic,
  Article,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useSearch } from '../../contexts/SearchContext';
import { useNavigate } from 'react-router-dom';

interface SearchResultsProps {
  onResultClick?: (resultId: string) => void;
  onClose?: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ onResultClick, onClose }) => {
  const { searchResults, isSearching, searchQuery, clearSearch, showSearchResults } = useSearch();
  const navigate = useNavigate();

  if (!showSearchResults) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'category':
        return <FolderOpen sx={{ color: 'primary.main' }} />;
      case 'topic':
        return <Topic sx={{ color: 'success.main' }} />;
      case 'content':
        return <Article sx={{ color: 'warning.main' }} />;
      default:
        return <SearchIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'category':
        return 'primary';
      case 'topic':
        return 'success';
      case 'content':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleResultClick = (resultId: string) => {
    // Navigate to content management page and select the item
    navigate('/content');
    if (onResultClick) {
      onResultClick(resultId);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleClearSearch = () => {
    clearSearch();
    if (onClose) {
      onClose();
    }
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        mt: 1,
        maxHeight: 400,
        overflow: 'auto',
        zIndex: 1300,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Search Results for "{searchQuery}"
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={handleClearSearch}
          startIcon={<ClearIcon />}
          sx={{ textTransform: 'none' }}
        >
          Clear
        </Button>
      </Box>

      {/* Loading State */}
      {isSearching && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Searching content...
          </Typography>
        </Box>
      )}

      {/* Results */}
      {!isSearching && (
        <>
          {searchResults.length > 0 ? (
            <List sx={{ py: 0 }}>
              {searchResults.map((result, index) => (
                <React.Fragment key={result.id}>
                  <ListItem
                    button
                    onClick={() => handleResultClick(result.id)}
                    sx={{
                      py: 2,
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getTypeIcon(result.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {result.title}
                          </Typography>
                          <Chip
                            label={result.type}
                            size="small"
                            color={getTypeColor(result.type) as any}
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          {/* Breadcrumb */}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            📁 {result.path.join(' → ')}
                          </Typography>
                          {/* Content preview */}
                          {result.content && (
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.3,
                            }}>
                              {result.content}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < searchResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No results found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try searching with different keywords or check your spelling.
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Footer */}
      {!isSearching && searchResults.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'grey.50' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon sx={{ fontSize: 14 }} />
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} • Click to view in Content Management
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default SearchResults; 