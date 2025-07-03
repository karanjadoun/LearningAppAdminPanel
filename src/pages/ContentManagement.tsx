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
  };
  return iconMap[iconName] || '📁';
};

// Helper function to check if string is a valid URL
const isValidUrl = (string: string): boolean => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// Helper function to render icon preview
const renderIconPreview = (icon: string | undefined): React.ReactNode => {
  if (!icon) {
    return <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: 1 }}>?</Box>;
  }
  
  if (isValidUrl(icon)) {
    return (
      <Box sx={{ position: 'relative', width: 24, height: 24 }}>
        <img 
          src={icon} 
          alt="Icon" 
          style={{ 
            width: 24, 
            height: 24, 
            borderRadius: 4, 
            objectFit: 'cover',
            border: '1px solid #e0e0e0'
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: 24, 
          height: 24, 
          display: 'none', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: '#f5f5f5', 
          borderRadius: 1,
          fontSize: '12px'
        }}>
          ❌
        </Box>
      </Box>
    );
  } else {
    return (
      <Box sx={{ fontSize: '1.5rem', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {getIconEmoji(icon)}
      </Box>
    );
  }
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
    categoryId: '',
    topicId: '',
  });

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
      categoryId: '',
      topicId: '',
    });
    setDialogOpen(true);
  };

  // Handle edit item
  const handleEdit = (item: ContentNode) => {
    setEditMode('edit');
    setSelectedItem(item);
    setFormData({
      title: item.title,
      content: item.content || '',
      colorHex: item.colorHex || '#6366f1',
      icon: item.icon || '',
      categoryId: (item as any).categoryId || '',
      topicId: (item as any).topicId || '',
    });
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
        let data: any = {
          title: formData.title,
          icon: formData.icon,
          colorHex: formData.colorHex, // Include color for ALL content types
        };

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
          // Creating content - include content body, color, and icon
          if (!formData.categoryId || !formData.topicId) {
            showSnackbar('Please select both category and topic', 'error');
            return;
          }
          data.content = formData.content; // Add content body for content items
          const topic = topics.find(t => t.id === formData.topicId);
          if (topic) {
            await contentService.createChild(topic.id, data, [...(topic.fullPath || []), 'children']);
            showSnackbar('Content created successfully', 'success');
          } else {
            showSnackbar('Error: Topic not found', 'error');
            return;
          }
        }
      } else {
        // Editing existing item
        if (selectedItem) {
          let data: any = {
            title: formData.title,
            icon: formData.icon,
            colorHex: formData.colorHex, // Include color for ALL content types
          };

          // Add content body only for content items
          if (activeTab === 2) {
            data.content = formData.content;
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {renderIconPreview(category.icon)}
                        {!category.icon && (
                        <CategoryIcon sx={{ color: category.colorHex, fontSize: '1.5rem' }} />
                      )}
                      </Box>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {renderIconPreview(topic.icon)}
                          {!topic.icon && (
                          <TopicIcon sx={{ color: topic.colorHex || 'primary.main', fontSize: '1.5rem' }} />
                        )}
                        </Box>
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
                    <TableCell>Color</TableCell>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {renderIconPreview(item.icon)}
                          {!item.icon && (
                            <ContentIcon sx={{ color: 'warning.main', fontSize: '1.5rem' }} />
                          )}
                        </Box>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: item.colorHex || '#f5f5f5',
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          />
                          <Typography variant="body2">{item.colorHex || 'No color'}</Typography>
                        </Box>
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
                      <TableCell colSpan={7} align="center">
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

            {/* Icon URL/Resource Input - For Categories, Topics, and Content */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                🖼️ Icon URL/Resource
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box sx={{ minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {renderIconPreview(formData.icon)}
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  label="Icon URL or Resource Name"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="Enter image URL (https://...) or resource name (ic_science)"
                  InputProps={{
                    style: { fontFamily: 'monospace' }
                  }}
                />
              </Box>
              
              {/* Icon validation and helper text */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {formData.icon && isValidUrl(formData.icon) && (
                  <Chip 
                    label="✅ Valid URL" 
                    size="small" 
                    color="success" 
                    variant="outlined"
                  />
                )}
                {formData.icon && !isValidUrl(formData.icon) && formData.icon.startsWith('ic_') && (
                  <Chip 
                    label="📱 Resource Name" 
                    size="small" 
                    color="info" 
                    variant="outlined"
                  />
                )}
                {formData.icon && !isValidUrl(formData.icon) && !formData.icon.startsWith('ic_') && (
                  <Chip 
                    label="⚠️ Invalid format" 
                    size="small" 
                    color="warning" 
                    variant="outlined"
                  />
                )}
              </Box>

              {/* Common resource name examples */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mb: 1 }}>
                  Common resource names:
                </Typography>
                {['ic_science', 'ic_math', 'ic_history', 'ic_english', 'ic_computer'].map((resource) => (
                  <Chip
                    key={resource}
                    label={resource}
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => setFormData(prev => ({ ...prev, icon: resource }))}
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            </Box>

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

            {/* Color Picker - For Categories, Topics, and Content */}
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