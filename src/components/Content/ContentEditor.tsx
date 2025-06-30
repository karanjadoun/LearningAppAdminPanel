import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import { Close, ColorLens } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ContentNode, FirestoreContentNode } from '../../types';

interface ContentEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<FirestoreContentNode>) => Promise<void>;
  node?: ContentNode;
  mode: 'create' | 'edit';
  nodeType: 'category' | 'topic' | 'content';
}

interface FormData {
  title: string;
  content: string;
  icon: string;
  colorHex: string;
}

const predefinedColors = [
  '#fe4a49', '#2ab7ca', '#fed766', '#e6e6ea', '#f4f4f8',
  '#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f',
  '#0288d1', '#388e3c', '#f57c00', '#7b1fa2', '#c62828',
];

const predefinedIcons = [
  'ic_math', 'ic_science', 'ic_english', 'ic_history', 'ic_geography',
  'ic_physics', 'ic_chemistry', 'ic_biology', 'ic_algebra', 'ic_geometry',
];

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'image'],
    ['clean'],
    ['code-block'],
  ],
};

const ContentEditor: React.FC<ContentEditorProps> = ({
  open,
  onClose,
  onSave,
  node,
  mode,
  nodeType,
}) => {
  const [saving, setSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#fe4a49');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      content: '',
      icon: '',
      colorHex: '#fe4a49',
    },
  });

  const watchedColor = watch('colorHex');

  useEffect(() => {
    if (node && mode === 'edit') {
      reset({
        title: node.title || '',
        content: node.content || '',
        icon: node.icon || '',
        colorHex: node.colorHex || '#fe4a49',
      });
      setSelectedColor(node.colorHex || '#fe4a49');
    } else {
      reset({
        title: '',
        content: '',
        icon: '',
        colorHex: '#fe4a49',
      });
      setSelectedColor('#fe4a49');
    }
  }, [node, mode, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);
      const submitData: Partial<FirestoreContentNode> = {
        title: data.title,
      };

      // Only add colorHex for categories and topics, NOT for content
      if (nodeType !== 'content') {
        submitData.colorHex = data.colorHex;
      }

      // Only add icon for categories
      if (nodeType === 'category' && data.icon) {
        submitData.icon = data.icon;
      }

      // Only add content for content items
      if (nodeType === 'content' && data.content) {
        submitData.content = data.content;
      }

      console.log('📤 Submitting data:', { nodeType, submitData });
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue('colorHex', color);
  };

  const getDialogTitle = () => {
    const action = mode === 'create' ? 'Create' : 'Edit';
    const type = nodeType === 'category' ? 'Category' : nodeType === 'topic' ? 'Topic' : 'Content';
    return `${action} ${type}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {getDialogTitle()}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {nodeType === 'content' ? 'Create educational content with rich formatting' :
             nodeType === 'topic' ? 'Add a new topic to organize content' :
             'Create a new category for your subjects'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ borderRadius: 2 }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Title Field */}
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Title"
                  fullWidth
                  variant="outlined"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              )}
            />

            {/* Icon Field (for categories only) */}
            {nodeType === 'category' && (
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Icon</InputLabel>
                    <Select {...field} label="Icon">
                      {predefinedIcons.map((icon) => (
                        <MenuItem key={icon} value={icon}>
                          {icon}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            )}

            {/* Color Picker - Only for categories and topics, not content */}
            {nodeType !== 'content' && (
              <Box sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <ColorLens sx={{ mr: 1 }} />
                  Choose Color Theme
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Select a color to represent this {nodeType}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                  {predefinedColors.map((color) => (
                    <Box
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: selectedColor === color ? '3px solid' : '2px solid transparent',
                        borderColor: selectedColor === color ? 'primary.main' : 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: 2,
                        },
                      }}
                    />
                  ))}
                </Box>
                <Controller
                  name="colorHex"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Custom Color (Hex)"
                      size="small"
                      variant="outlined"
                      sx={{ 
                        maxWidth: 200,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                      onChange={(e) => {
                        field.onChange(e);
                        setSelectedColor(e.target.value);
                      }}
                    />
                  )}
                />
              </Box>
            )}

            {/* Content Editor (for content items only) */}
            {nodeType === 'content' && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Content Editor
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Create rich educational content with formatting, images, and more
                </Typography>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      overflow: 'hidden',
                      '& .ql-toolbar': {
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'grey.50',
                      },
                      '& .ql-container': {
                        minHeight: '300px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                      },
                      '& .ql-editor': {
                        minHeight: '300px',
                        padding: '16px',
                      }
                    }}>
                      <ReactQuill
                        {...field}
                        modules={quillModules}
                        theme="snow"
                        placeholder="Start writing your content here..."
                      />
                    </Box>
                  )}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 4, 
          pt: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 2 
        }}>
          <Button 
            onClick={onClose} 
            disabled={saving}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 100
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 120
            }}
          >
            {saving ? 'Saving...' : `Save ${nodeType === 'content' ? 'Content' : nodeType === 'topic' ? 'Topic' : 'Category'}`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContentEditor; 