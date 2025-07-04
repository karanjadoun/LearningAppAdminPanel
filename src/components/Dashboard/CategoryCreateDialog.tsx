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
  Slider,
  Chip,
  InputAdornment,
  Card,
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

const resourceSuggestions = [
  'ic_science', 'ic_math', 'ic_history', 'ic_english', 'ic_computer'
];

const CategoryCreateDialog: React.FC<CategoryCreateDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [colorHex, setColorHex] = useState('#2196f3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper functions
  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

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
        icon: icon.trim(),
        colorHex: colorHex,
      };
      await contentService.createRootCategory(categoryData);
      setTitle('');
      setIcon('');
      setColorHex('#2196f3');
      onSuccess();
      onClose();
    } catch (error) {
      setError('Failed to create category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setIcon('');
      setColorHex('#2196f3');
      setError(null);
      onClose();
    }
  };

  // For color slider
  const handleColorSlider = (e: any, value: any) => {
    // value is a number (0-359 for hue)
    const h = value;
    const s = 80;
    const l = 60;
    setColorHex(`hsl(${h},${s}%,${l}%)`);
  };
  const getHue = (hex: string) => {
    // Convert hex to hue for slider
    const rgb = hex.length === 7 ? [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ] : [33, 150, 243];
    const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    if (max === min) h = 0;
    else if (max === r) h = (60 * ((g - b) / (max - min)) + 360) % 360;
    else if (max === g) h = (60 * ((b - r) / (max - min)) + 120) % 360;
    else h = (60 * ((r - g) / (max - min)) + 240) % 360;
    return Math.round(h);
  };

  // Preview rendering (emoji fallback)
  const getIconEmoji = (iconName: string): string => {
    const iconMap: { [key: string]: string } = {
      'ic_math': '📐',
      'ic_science': '🔬',
      'ic_history': '📚',
      'ic_english': '📝',
      'ic_computer': '💻',
    };
    return iconMap[iconName] || '📁';
  };
  const renderIconPreview = (icon: string) => {
    if (!icon) return <Box sx={{ width: 24, height: 24, bgcolor: '#f5f5f5', borderRadius: 1 }}>?</Box>;
    if (isValidUrl(icon)) {
      return <img src={icon} alt="icon" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover', border: '1px solid #e0e0e0' }} />;
    }
    if (icon.startsWith('ic_')) return <span style={{ fontSize: 24 }}>{getIconEmoji(icon)}</span>;
    return <span style={{ fontSize: 24 }}>?</span>;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Create Category
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
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={loading}
            required
          />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              🖼️ Icon URL/Resource
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderIconPreview(icon)}
              </Box>
              <TextField
                fullWidth
                size="small"
                label="Icon URL or Resource Name"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                placeholder="Enter image URL (https://...) or resource name (ic_science)"
                InputProps={{ style: { fontFamily: 'monospace' } }}
                disabled={loading}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {icon && isValidUrl(icon) && (
                <Chip label="✅ Valid URL" size="small" color="success" variant="outlined" />
              )}
              {icon && !isValidUrl(icon) && icon.startsWith('ic_') && (
                <Chip label="📱 Resource Name" size="small" color="info" variant="outlined" />
              )}
              {icon && !isValidUrl(icon) && !icon.startsWith('ic_') && (
                <Chip label="⚠️ Invalid format" size="small" color="warning" variant="outlined" />
              )}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mb: 1 }}>
                Common resource names:
              </Typography>
              {resourceSuggestions.map(resource => (
                <Chip
                  key={resource}
                  label={resource}
                  size="small"
                  variant="outlined"
                  clickable
                  onClick={() => setIcon(resource)}
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              🎨 Color
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: colorHex, border: '1px solid #e0e0e0' }} />
              <TextField
                size="small"
                label="Hex Color"
                value={colorHex}
                onChange={e => setColorHex(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">🎨</InputAdornment> }}
                sx={{ width: 140 }}
                disabled={loading}
              />
            </Box>
            <Slider
              min={0}
              max={359}
              value={getHue(colorHex)}
              onChange={handleColorSlider}
              sx={{ maxWidth: 300 }}
              disabled={loading}
            />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Preview
            </Typography>
            <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, maxWidth: 350 }}>
              <Avatar sx={{ bgcolor: colorHex, width: 48, height: 48, fontSize: 32 }}>
                {renderIconPreview(icon)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {title || 'Category Title'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Subject Category
                </Typography>
              </Box>
            </Card>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !title.trim()}>
          {loading ? <CircularProgress size={20} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryCreateDialog; 