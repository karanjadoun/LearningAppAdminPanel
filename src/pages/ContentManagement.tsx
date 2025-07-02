import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Menu,
  MenuItem as MenuItemComponent,
  InputAdornment,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Folder as CategoryIcon,
  Topic as TopicIcon,
  Article as ContentIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette as PaletteIcon,
  BrokenImage as BrokenImageIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { contentService } from '../services/contentService';
import { auth } from '../config/firebase';
import { ContentNode, FirestoreContentNode } from '../types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper function to get emoji for icon names
const getIconEmoji = (iconName: string): string => {
  const iconMap: { [key: string]: string } = {
    // Subject Icons
    'ic_math': '📐',
    'ic_science': '🔬',
    'ic_history': '📚',
    'ic_geography': '🌍',
    'ic_english': '📝',
    'ic_physics': '⚛️',
    'ic_chemistry': '🧪',
    'ic_biology': '🧬',
    'ic_computer': '💻',
    'ic_art': '🎨',
    'ic_music': '🎵',
    'ic_sports': '⚽',
    'ic_language': '🌐',
    'ic_economics': '💰',
    'ic_philosophy': '🤔',
    'ic_psychology': '🧠',
    'ic_literature': '📖',
    'ic_engineering': '⚙️',
    'ic_medicine': '⚕️',
    'ic_law': '⚖️',
    // Content-specific Icons
    'ic_lesson': '📖',
    'ic_experiment': '🧪',
    'ic_theory': '📋',
    'ic_practice': '✍️',
    'ic_video': '🎥',
    'ic_audio': '🎧',
    'ic_document': '📄',
    'ic_worksheet': '📝',
    'ic_quiz': '❓',
    'ic_assignment': '📌',
    'ic_research': '🔍',
    'ic_presentation': '📊',
    'ic_tutorial': '🎯',
    'ic_guide': '🗺️',
    'ic_example': '💡',
    'ic_solution': '✅',
    'ic_formula': '🔢',
    'ic_diagram': '📐',
    'ic_chart': '📈',
    'ic_table': '📊',
  };
  return iconMap[iconName] || '📁';
};

const ContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<ContentNode | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Filter states for Topics
  const [topicFilters, setTopicFilters] = useState({
    search: '',
    categoryId: '',
    hasContent: '',
  });

  // Filter states for Content
  const [contentFilters, setContentFilters] = useState({
    search: '',
    categoryId: '',
    topicId: '',
    hasContent: '',
  });
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    colorHex: '#6366f1',
    icon: '',
    iconUrl: '',
    iconType: 'predefined', // 'predefined' or 'url'
    categoryId: '',
    topicId: '',
  });

  // Icon management states
  const [iconUrlPreview, setIconUrlPreview] = useState<string | null>(null);
  const [iconUrlError, setIconUrlError] = useState<string | null>(null);
  const [iconUrlLoading, setIconUrlLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const queryClient = useQueryClient();

  // Load data
  const { data: contentTree, isLoading } = useQuery({
    queryKey: ['contentTree'],
    queryFn: () => contentService.getContentTree(),
  });

  // Helper functions
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['contentTree'] });
  };

  // Icon URL validation
  const validateIconUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Icon URL preview loader
  const loadIconPreview = async (url: string) => {
    if (!url || !validateIconUrl(url)) {
      setIconUrlPreview(null);
      setIconUrlError('Invalid URL format');
      return;
    }

    setIconUrlLoading(true);
    setIconUrlError(null);

    try {
      // Test if the image loads
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });

      setIconUrlPreview(url);
      setIconUrlError(null);
    } catch (error) {
      setIconUrlPreview(null);
      setIconUrlError('Unable to load image from URL');
    } finally {
      setIconUrlLoading(false);
    }
  };

  // Extract categories, topics, and content from tree
  const categories = contentTree || [];
  const allTopics = categories.flatMap(cat => 
    (cat.children || []).map(topic => ({ ...topic, categoryId: cat.id, categoryTitle: cat.title }))
  );
  const allContent = allTopics.flatMap(topic => 
    (topic.children || []).map(content => ({ 
      ...content, 
      categoryId: (topic as any).categoryId, 
      categoryTitle: (topic as any).categoryTitle,
      topicId: topic.id,
      topicTitle: topic.title 
    }))
  );

  // Apply filters to topics
  const topics = allTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(topicFilters.search.toLowerCase());
    const matchesCategory = !topicFilters.categoryId || (topic as any).categoryId === topicFilters.categoryId;
    const matchesHasContent = !topicFilters.hasContent || 
      (topicFilters.hasContent === 'yes' && (topic.children?.length || 0) > 0) ||
      (topicFilters.hasContent === 'no' && (topic.children?.length || 0) === 0);
    
    return matchesSearch && matchesCategory && matchesHasContent;
  });

  // Apply filters to content
  const content = allContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(contentFilters.search.toLowerCase());
    const matchesCategory = !contentFilters.categoryId || (item as any).categoryId === contentFilters.categoryId;
    const matchesTopic = !contentFilters.topicId || (item as any).topicId === contentFilters.topicId;
    const matchesHasContent = !contentFilters.hasContent ||
      (contentFilters.hasContent === 'yes' && item.content) ||
      (contentFilters.hasContent === 'no' && !item.content);
    
    return matchesSearch && matchesCategory && matchesTopic && matchesHasContent;
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle create new item
  const handleCreate = (type: 'category' | 'topic' | 'content') => {
    setEditMode('create');
    setSelectedItem(null);
    setFormData({
      title: '',
      content: '',
      colorHex: '#6366f1',
      icon: '',
      iconUrl: '',
      iconType: 'predefined',
      categoryId: '',
      topicId: '',
    });
    // Reset icon states
    setIconUrlPreview(null);
    setIconUrlError(null);
    setIconUrlLoading(false);
    setDialogOpen(true);
  };

  // Handle edit item
  const handleEdit = (item: ContentNode) => {
    setEditMode('edit');
    setSelectedItem(item);
    
    // Determine icon type and set appropriate fields
    const hasIconUrl = (item as any).iconUrl;
    const iconType = hasIconUrl ? 'url' : 'predefined';
    
    setFormData({
      title: item.title,
      content: item.content || '',
      colorHex: item.colorHex || '#6366f1',
      icon: iconType === 'predefined' ? (item.icon || '') : '',
      iconUrl: hasIconUrl || '',
      iconType: iconType,
      categoryId: (item as any).categoryId || '',
      topicId: (item as any).topicId || '',
    });

    // Reset icon states
    setIconUrlError(null);
    setIconUrlLoading(false);
    
    // Load icon preview if URL exists
    if (hasIconUrl) {
      setIconUrlPreview(hasIconUrl);
    } else {
      setIconUrlPreview(null);
    }
    
    setDialogOpen(true);
  };

  // Handle save
  const handleSave = async () => {
    try {
      if (!formData.title.trim()) {
        showSnackbar('Title is required', 'error');
        return;
      }

      if (editMode === 'create') {
        const data: any = {
          title: formData.title,
          content: formData.content,
        };

        // Only add colorHex for categories and topics, not content
        if (activeTab === 0 || activeTab === 1) {
          data.colorHex = formData.colorHex;
        }

        // Handle icon data based on type
        if (formData.iconType === 'url') {
          if (formData.iconUrl && validateIconUrl(formData.iconUrl)) {
            data.iconUrl = formData.iconUrl;
            data.iconType = 'url';
            data.icon = null; // Clear predefined icon
          } else {
            showSnackbar('Please provide a valid icon URL', 'error');
            return;
          }
        } else {
          data.icon = formData.icon;
          data.iconType = 'predefined';
          data.iconUrl = null; // Clear URL
        }

        if (activeTab === 0) {
          // Creating category
          await contentService.createRootCategory(data);
          showSnackbar('Category created successfully', 'success');
        } else if (activeTab === 1) {
          // Creating topic
          if (!formData.categoryId) {
            showSnackbar('Please select a category', 'error');
            return;
          }
          const category = categories.find(c => c.id === formData.categoryId);
          if (category) {
            await contentService.createChild(category.id, data, [...(category.fullPath || []), 'children']);
            showSnackbar('Topic created successfully', 'success');
          }
        } else if (activeTab === 2) {
          // Creating content
          if (!formData.categoryId || !formData.topicId) {
            showSnackbar('Please select both category and topic', 'error');
            return;
          }
          const topic = topics.find(t => t.id === formData.topicId);
          if (topic) {
            await contentService.createChild(topic.id, data, [...(topic.fullPath || []), 'children']);
            showSnackbar('Content created successfully', 'success');
          }
        }
      } else {
        // Editing existing item
        if (selectedItem) {
          const data: any = {
            title: formData.title,
            content: formData.content,
          };

          // Only add colorHex for categories and topics, not content
          if (activeTab === 0 || activeTab === 1) {
            data.colorHex = formData.colorHex;
          }

          // Handle icon data based on type
          if (formData.iconType === 'url') {
            if (formData.iconUrl && validateIconUrl(formData.iconUrl)) {
              data.iconUrl = formData.iconUrl;
              data.iconType = 'url';
              data.icon = null; // Clear predefined icon
            } else {
              showSnackbar('Please provide a valid icon URL', 'error');
              return;
            }
          } else {
            data.icon = formData.icon;
            data.iconType = 'predefined';
            data.iconUrl = null; // Clear URL
          }

          await contentService.updateNode(selectedItem.id, data, selectedItem.fullPath);
          showSnackbar('Item updated successfully', 'success');
        }
      }

      setDialogOpen(false);
      refreshData();
    } catch (error) {
      console.error('Error saving:', error);
      showSnackbar('Error saving item', 'error');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      await contentService.deleteNode(selectedItem.id, selectedItem.fullPath);
      showSnackbar('Item deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      refreshData();
    } catch (error) {
      console.error('Error deleting:', error);
      showSnackbar('Error deleting item', 'error');
    }
  };

  // Handle menu actions
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: ContentNode) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getDialogTitle = () => {
    const types = ['Category', 'Topic', 'Content'];
    const action = editMode === 'create' ? 'Create' : 'Edit';
    return `${action} ${types[activeTab]}`;
  };

  // Filter helper functions
  const clearTopicFilters = () => {
    setTopicFilters({
      search: '',
      categoryId: '',
      hasContent: '',
    });
  };

  const clearContentFilters = () => {
    setContentFilters({
      search: '',
      categoryId: '',
      topicId: '',
      hasContent: '',
    });
  };

  const hasActiveTopicFilters = topicFilters.search || topicFilters.categoryId || topicFilters.hasContent;
  const hasActiveContentFilters = contentFilters.search || contentFilters.categoryId || contentFilters.topicId || contentFilters.hasContent;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Content Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your learning content in a simple, organized way
        </Typography>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              icon={<CategoryIcon />} 
              label={`Categories (${categories.length})`} 
              iconPosition="start"
            />
            <Tab 
              icon={<TopicIcon />} 
              label={`Topics (${topics.length}${hasActiveTopicFilters ? ` of ${allTopics.length}` : ''})`} 
              iconPosition="start"
            />
            <Tab 
              icon={<ContentIcon />} 
              label={`Content (${content.length}${hasActiveContentFilters ? ` of ${allContent.length}` : ''})`} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Categories Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Categories</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleCreate('category')}
            >
              Add Category
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Icon</TableCell>
                  <TableCell>Topics</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Typography>{category.title}</Typography>
                    </TableCell>
                    <TableCell>
                      {(category as any).iconUrl ? (
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent' }}>
                          <img 
                            src={(category as any).iconUrl} 
                            alt={category.title}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain',
                              borderRadius: '50%'
                            }}
                            onError={(e) => {
                              // Fallback to default icon if URL fails
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = `<svg style="color: ${category.colorHex}; font-size: 1.5rem;"><use href="#category-icon"></use></svg>`;
                            }}
                          />
                        </Avatar>
                      ) : category.icon ? (
                        <Box sx={{ fontSize: '1.5rem' }}>
                          {getIconEmoji(category.icon)}
                        </Box>
                      ) : (
                        <CategoryIcon sx={{ color: category.colorHex, fontSize: '1.5rem' }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${category.children?.length || 0} topics`} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: category.colorHex,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                        <Typography variant="body2">{category.colorHex}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuClick(e, category)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">No categories yet. Create your first category!</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Topics Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Topics</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleCreate('topic')}
              disabled={categories.length === 0}
            >
              Add Topic
            </Button>
          </Box>

          {categories.length === 0 ? (
            <Alert severity="info">
              Create categories first before adding topics.
            </Alert>
          ) : (
            <>
              {/* Topics Filters */}
              <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <FilterIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>Filters</Typography>
                  {hasActiveTopicFilters && (
                    <Button
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={clearTopicFilters}
                      sx={{ ml: 'auto' }}
                    >
                      Clear All
                    </Button>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search topics..."
                      value={topicFilters.search}
                      onChange={(e) => setTopicFilters(prev => ({ ...prev, search: e.target.value }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={topicFilters.categoryId}
                        onChange={(e) => setTopicFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                        label="Category"
                      >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Has Content</InputLabel>
                      <Select
                        value={topicFilters.hasContent}
                        onChange={(e) => setTopicFilters(prev => ({ ...prev, hasContent: e.target.value }))}
                        label="Has Content"
                      >
                        <MenuItem value="">All Topics</MenuItem>
                        <MenuItem value="yes">Has Content Items</MenuItem>
                        <MenuItem value="no">Empty Topics</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Card>
            </>
          )}

          {categories.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Icon</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Content Items</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell>
                        <Typography>{topic.title}</Typography>
                      </TableCell>
                      <TableCell>
                        {(topic as any).iconUrl ? (
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent' }}>
                            <img 
                              src={(topic as any).iconUrl} 
                              alt={topic.title}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain',
                                borderRadius: '50%'
                              }}
                              onError={(e) => {
                                // Fallback to default icon if URL fails
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = `<svg style="color: ${topic.colorHex || 'primary.main'}; font-size: 1.5rem;"><use href="#topic-icon"></use></svg>`;
                              }}
                            />
                          </Avatar>
                        ) : topic.icon ? (
                          <Box sx={{ fontSize: '1.5rem' }}>
                            {getIconEmoji(topic.icon)}
                          </Box>
                        ) : (
                          <TopicIcon sx={{ color: topic.colorHex || 'primary.main', fontSize: '1.5rem' }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={(topic as any).categoryTitle} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${topic.children?.length || 0} items`} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuClick(e, topic)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {topics.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">
                          {hasActiveTopicFilters ? 'No topics match your filters.' : 'No topics yet. Create your first topic!'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Content Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Content</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleCreate('content')}
              disabled={allTopics.length === 0}
            >
              Add Content
            </Button>
          </Box>

          {allTopics.length === 0 ? (
            <Alert severity="info">
              Create categories and topics first before adding content.
            </Alert>
          ) : (
            <>
              {/* Content Filters */}
              <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <FilterIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>Filters</Typography>
                  {hasActiveContentFilters && (
                    <Button
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={clearContentFilters}
                      sx={{ ml: 'auto' }}
                    >
                      Clear All
                    </Button>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search content..."
                      value={contentFilters.search}
                      onChange={(e) => setContentFilters(prev => ({ ...prev, search: e.target.value }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={contentFilters.categoryId}
                        onChange={(e) => {
                          setContentFilters(prev => ({ ...prev, categoryId: e.target.value, topicId: '' }));
                        }}
                        label="Category"
                      >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Topic</InputLabel>
                      <Select
                        value={contentFilters.topicId}
                        onChange={(e) => setContentFilters(prev => ({ ...prev, topicId: e.target.value }))}
                        label="Topic"
                        disabled={!contentFilters.categoryId}
                      >
                        <MenuItem value="">All Topics</MenuItem>
                        {allTopics
                          .filter(topic => !contentFilters.categoryId || (topic as any).categoryId === contentFilters.categoryId)
                          .map((topic) => (
                            <MenuItem key={topic.id} value={topic.id}>
                              {topic.title}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Has Content</InputLabel>
                      <Select
                        value={contentFilters.hasContent}
                        onChange={(e) => setContentFilters(prev => ({ ...prev, hasContent: e.target.value }))}
                        label="Has Content"
                      >
                        <MenuItem value="">All Items</MenuItem>
                        <MenuItem value="yes">Has Content</MenuItem>
                        <MenuItem value="no">Empty Items</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Card>
            </>
          )}

          {allTopics.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Icon</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Topic</TableCell>
                    <TableCell>Has Content</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {content.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography>{item.title}</Typography>
                      </TableCell>
                      <TableCell>
                        {(item as any).iconUrl ? (
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent' }}>
                            <img 
                              src={(item as any).iconUrl} 
                              alt={item.title}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain',
                                borderRadius: '50%'
                              }}
                              onError={(e) => {
                                // Fallback to default icon if URL fails
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = `<svg style="color: warning.main; font-size: 1.5rem;"><use href="#content-icon"></use></svg>`;
                              }}
                            />
                          </Avatar>
                        ) : (item as any).icon ? (
                          <Box sx={{ fontSize: '1.5rem' }}>
                            {getIconEmoji((item as any).icon)}
                          </Box>
                        ) : (
                          <ContentIcon sx={{ color: 'warning.main', fontSize: '1.5rem' }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={(item as any).categoryTitle} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={(item as any).topicTitle} 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.content ? 'Yes' : 'No'} 
                          size="small" 
                          color={item.content ? 'success' : 'default'}
                          variant={item.content ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuClick(e, item)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {content.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">
                          {hasActiveContentFilters ? 'No content matches your filters.' : 'No content yet. Create your first content item!'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItemComponent onClick={() => { handleEdit(selectedItem!); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItemComponent>
        <MenuItemComponent 
          onClick={() => { setDeleteDialogOpen(true); handleMenuClose(); }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItemComponent>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{getDialogTitle()}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />

            {(activeTab === 0 || activeTab === 1 || activeTab === 2) && (
              <Card variant="outlined" sx={{ p: 3, backgroundColor: 'grey.50' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ImageIcon />
                  Icon Selection
                </Typography>
                
                {/* Icon Type Selection */}
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Icon Source
                  </Typography>
                  <RadioGroup
                    row
                    value={formData.iconType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        iconType: newType,
                        // Clear the other field when switching
                        icon: newType === 'predefined' ? prev.icon : '',
                        iconUrl: newType === 'url' ? prev.iconUrl : ''
                      }));
                      if (newType === 'predefined') {
                        setIconUrlPreview(null);
                        setIconUrlError(null);
                      }
                    }}
                  >
                    <FormControlLabel 
                      value="predefined" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PaletteIcon fontSize="small" />
                          Predefined Icon
                        </Box>
                      }
                    />
                    <FormControlLabel 
                      value="url" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinkIcon fontSize="small" />
                          Custom URL
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                {/* Predefined Icon Selection */}
                {formData.iconType === 'predefined' && (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Icon</InputLabel>
                    <Select
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      label="Select Icon"
                    >
                      <MenuItem value="">
                        <em>No Icon</em>
                      </MenuItem>
                      {/* Subject Icons */}
                      <MenuItem value="ic_math">📐 Mathematics</MenuItem>
                      <MenuItem value="ic_science">🔬 Science</MenuItem>
                      <MenuItem value="ic_history">📚 History</MenuItem>
                      <MenuItem value="ic_geography">🌍 Geography</MenuItem>
                      <MenuItem value="ic_english">📝 English</MenuItem>
                      <MenuItem value="ic_physics">⚛️ Physics</MenuItem>
                      <MenuItem value="ic_chemistry">🧪 Chemistry</MenuItem>
                      <MenuItem value="ic_biology">🧬 Biology</MenuItem>
                      <MenuItem value="ic_computer">💻 Computer Science</MenuItem>
                      <MenuItem value="ic_art">🎨 Art</MenuItem>
                      <MenuItem value="ic_music">🎵 Music</MenuItem>
                      <MenuItem value="ic_sports">⚽ Sports</MenuItem>
                      <MenuItem value="ic_language">🌐 Languages</MenuItem>
                      <MenuItem value="ic_economics">💰 Economics</MenuItem>
                      <MenuItem value="ic_philosophy">🤔 Philosophy</MenuItem>
                      <MenuItem value="ic_psychology">🧠 Psychology</MenuItem>
                      <MenuItem value="ic_literature">📖 Literature</MenuItem>
                      <MenuItem value="ic_engineering">⚙️ Engineering</MenuItem>
                      <MenuItem value="ic_medicine">⚕️ Medicine</MenuItem>
                      <MenuItem value="ic_law">⚖️ Law</MenuItem>
                      {/* Content-specific Icons */}
                      {activeTab === 2 && (
                        <>
                          <MenuItem value="ic_lesson">📖 Lesson</MenuItem>
                          <MenuItem value="ic_experiment">🧪 Experiment</MenuItem>
                          <MenuItem value="ic_theory">📋 Theory</MenuItem>
                          <MenuItem value="ic_practice">✍️ Practice</MenuItem>
                          <MenuItem value="ic_video">🎥 Video</MenuItem>
                          <MenuItem value="ic_audio">🎧 Audio</MenuItem>
                          <MenuItem value="ic_document">📄 Document</MenuItem>
                          <MenuItem value="ic_worksheet">📝 Worksheet</MenuItem>
                          <MenuItem value="ic_quiz">❓ Quiz</MenuItem>
                          <MenuItem value="ic_assignment">📌 Assignment</MenuItem>
                          <MenuItem value="ic_research">🔍 Research</MenuItem>
                          <MenuItem value="ic_presentation">📊 Presentation</MenuItem>
                          <MenuItem value="ic_tutorial">🎯 Tutorial</MenuItem>
                          <MenuItem value="ic_guide">🗺️ Guide</MenuItem>
                          <MenuItem value="ic_example">💡 Example</MenuItem>
                          <MenuItem value="ic_solution">✅ Solution</MenuItem>
                          <MenuItem value="ic_formula">🔢 Formula</MenuItem>
                          <MenuItem value="ic_diagram">📐 Diagram</MenuItem>
                          <MenuItem value="ic_chart">📈 Chart</MenuItem>
                          <MenuItem value="ic_table">📊 Table</MenuItem>
                        </>
                      )}
                    </Select>
                  </FormControl>
                )}

                {/* Custom URL Input */}
                {formData.iconType === 'url' && (
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Icon URL"
                      placeholder="https://example.com/icon.png or https://cdn.iconscout.com/..."
                      value={formData.iconUrl}
                      onChange={(e) => {
                        const url = e.target.value;
                        setFormData(prev => ({ ...prev, iconUrl: url }));
                        
                        // Debounce URL validation
                        if (url) {
                          setTimeout(() => {
                            if (formData.iconUrl === url) {
                              loadIconPreview(url);
                            }
                          }, 500);
                        } else {
                          setIconUrlPreview(null);
                          setIconUrlError(null);
                        }
                      }}
                      error={Boolean(iconUrlError)}
                      helperText={iconUrlError || 'Enter a direct link to an image file (PNG, JPG, SVG, WebP)'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    {/* URL Examples */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Example URLs:</strong>
                      </Typography>
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          • https://img.icons8.com/color/48/000000/physics.png
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          • https://cdn.iconscout.com/icon/free/png-256/mathematics-1674925-1425228.png
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          • https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@main/icons/science.svg
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Icon Preview */}
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 2, 
                  backgroundColor: 'background.paper' 
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Preview:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {formData.iconType === 'predefined' && formData.icon ? (
                      <>
                        <Avatar sx={{ 
                          bgcolor: formData.colorHex, 
                          width: 48, 
                          height: 48,
                          fontSize: '1.5rem'
                        }}>
                          {getIconEmoji(formData.icon)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {formData.title || (activeTab === 0 ? 'Category Title' : activeTab === 1 ? 'Topic Title' : 'Content Title')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Predefined: {formData.icon}
                          </Typography>
                        </Box>
                      </>
                    ) : formData.iconType === 'url' && iconUrlPreview ? (
                      <>
                        <Avatar sx={{ 
                          bgcolor: 'transparent', 
                          width: 48, 
                          height: 48,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <img 
                            src={iconUrlPreview} 
                            alt="Icon preview"
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain',
                              borderRadius: '50%'
                            }}
                            onError={() => {
                              setIconUrlPreview(null);
                              setIconUrlError('Failed to load image');
                            }}
                          />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {formData.title || (activeTab === 0 ? 'Category Title' : activeTab === 1 ? 'Topic Title' : 'Content Title')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Custom URL: {iconUrlLoading ? 'Loading...' : 'Loaded successfully'}
                          </Typography>
                        </Box>
                      </>
                    ) : formData.iconType === 'url' && iconUrlError ? (
                      <>
                        <Avatar sx={{ 
                          bgcolor: 'error.light', 
                          width: 48, 
                          height: 48,
                          color: 'error.main'
                        }}>
                          <BrokenImageIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" color="error.main" fontWeight={600}>
                            Failed to load icon
                          </Typography>
                          <Typography variant="body2" color="error.main">
                            {iconUrlError}
                          </Typography>
                        </Box>
                      </>
                    ) : formData.iconType === 'url' && iconUrlLoading ? (
                      <>
                        <Avatar sx={{ 
                          bgcolor: 'grey.200', 
                          width: 48, 
                          height: 48 
                        }}>
                          <CircularProgress size={24} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Loading icon...
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Testing URL accessibility
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Avatar sx={{ 
                          bgcolor: formData.colorHex, 
                          width: 48, 
                          height: 48 
                        }}>
                          <CategoryIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {formData.title || (activeTab === 0 ? 'Category Title' : activeTab === 1 ? 'Topic Title' : 'Content Title')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            No icon selected
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </Card>
            )}

            {activeTab === 1 && (
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {activeTab === 2 && (
              <>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, categoryId: e.target.value, topicId: '' }));
                    }}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Topic</InputLabel>
                  <Select
                    value={formData.topicId}
                    onChange={(e) => setFormData(prev => ({ ...prev, topicId: e.target.value }))}
                    label="Topic"
                    disabled={!formData.categoryId}
                  >
                    {allTopics
                      .filter(topic => (topic as any).categoryId === formData.categoryId)
                      .map((topic) => (
                        <MenuItem key={topic.id} value={topic.id}>
                          {topic.title}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </>
            )}

            {(activeTab === 0 || activeTab === 1) && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🎨 Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <input
                    type="color"
                    value={formData.colorHex}
                    onChange={(e) => setFormData(prev => ({ ...prev, colorHex: e.target.value }))}
                    style={{ 
                      width: 50, 
                      height: 40, 
                      border: 'none', 
                      borderRadius: 8, 
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                  <TextField
                    size="small"
                    label="Hex Color"
                    value={formData.colorHex}
                    onChange={(e) => setFormData(prev => ({ ...prev, colorHex: e.target.value }))}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                      style: { fontFamily: 'monospace' }
                    }}
                  />
                </Box>
                <Box sx={{ 
                  width: '100%', 
                  height: 20, 
                  backgroundColor: formData.colorHex,
                  borderRadius: 1,
                  border: '1px solid #E5E7EB'
                }} />
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Content
                </Typography>
                <ReactQuill
                  value={formData.content}
                  onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                  style={{ height: 200, marginBottom: 50 }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedItem?.title}"?
            {selectedItem && !selectedItem.content && " This will also delete all child items."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
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

export default ContentManagement; 