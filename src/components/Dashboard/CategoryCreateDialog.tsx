import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  IconButton,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Science as ScienceIcon,
  Calculate as MathIcon,
  Language as LanguageIcon,
  History as HistoryIcon,
  Public as GeographyIcon,
  Palette as ArtIcon,
  SportsBasketball as SportsIcon,
  Computer as ComputerIcon,
  MusicNote as MusicIcon,
} from '@mui/icons-material';
import { contentService } from '../../services/contentService';

interface CategoryCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const iconOptions = [
  { name: 'School', icon: SchoolIcon, value: 'ic_school' },
  { name: 'Science', icon: ScienceIcon, value: 'ic_science' },
  { name: 'Math', icon: MathIcon, value: 'ic_math' },
  { name: 'Language', icon: LanguageIcon, value: 'ic_language' },
  { name: 'History', icon: HistoryIcon, value: 'ic_history' },
  { name: 'Geography', icon: GeographyIcon, value: 'ic_geography' },
  { name: 'Art', icon: ArtIcon, value: 'ic_art' },
  { name: 'Sports', icon: SportsIcon, value: 'ic_sports' },
  { name: 'Computer', icon: ComputerIcon, value: 'ic_computer' },
  { name: 'Music', icon: MusicIcon, value: 'ic_music' },
];

const colorOptions = [
  { name: 'Blue', value: '#2196f3' },
  { name: 'Green', value: '#4caf50' },
  { name: 'Orange', value: '#ff9800' },
  { name: 'Red', value: '#f44336' },
  { name: 'Purple', value: '#9c27b0' },
  { name: 'Teal', value: '#009688' },
  { name: 'Pink', value: '#e91e63' },
  { name: 'Indigo', value: '#3f51b5' },
];

const CategoryCreateDialog: React.FC<CategoryCreateDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('ic_school');
  const [selectedColor, setSelectedColor] = useState('#2196f3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a category title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const categoryData = {
        title: title.trim(),
        icon: selectedIcon,
        colorHex: selectedColor,
      };

      await contentService.createRootCategory(categoryData);
      
      // Reset form
      setTitle('');
      setSelectedIcon('ic_school');
      setSelectedColor('#2196f3');
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Failed to create category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setSelectedIcon('ic_school');
      setSelectedColor('#2196f3');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Create New Category
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new subject category to organize your content
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Category Title
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g., Mathematics, Science, History"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Choose Icon
          </Typography>
          <Grid container spacing={1}>
            {iconOptions.map((option) => (
              <Grid item key={option.value}>
                <IconButton
                  onClick={() => setSelectedIcon(option.value)}
                  disabled={loading}
                  sx={{
                    width: 60,
                    height: 60,
                    border: '2px solid',
                    borderColor: selectedIcon === option.value ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    backgroundColor: selectedIcon === option.value ? 'primary.light' : 'transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.light',
                    },
                  }}
                >
                  <option.icon
                    sx={{
                      fontSize: 24,
                      color: selectedIcon === option.value ? 'primary.main' : 'text.secondary',
                    }}
                  />
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Choose Color
          </Typography>
          <Grid container spacing={1}>
            {colorOptions.map((option) => (
              <Grid item key={option.value}>
                <IconButton
                  onClick={() => setSelectedColor(option.value)}
                  disabled={loading}
                  sx={{
                    width: 50,
                    height: 50,
                    border: '3px solid',
                    borderColor: selectedColor === option.value ? '#000' : 'transparent',
                    borderRadius: '50%',
                    backgroundColor: option.value,
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Preview */}
        <Box
          sx={{
            mt: 3,
            p: 3,
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 2,
            backgroundColor: 'grey.50',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Preview
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                backgroundColor: selectedColor,
                width: 48,
                height: 48,
              }}
            >
              {React.createElement(
                iconOptions.find(opt => opt.value === selectedIcon)?.icon || SchoolIcon,
                { sx: { fontSize: 24, color: 'white' } }
              )}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title || 'Category Title'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Subject Category
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{
            borderRadius: 2,
            px: 3,
          }}
        >
          {loading ? 'Creating...' : 'Create Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryCreateDialog; 