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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Folder as CategoryIcon,
  Topic as TopicIcon,
  Article as ContentIcon,
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

const ContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<ContentNode | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
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
  const topics = categories.flatMap(cat => 
    (cat.children || []).map(topic => ({ ...topic, categoryId: cat.id, categoryTitle: cat.title }))
  );
  const content = topics.flatMap(topic => 
    (topic.children || []).map(content => ({ 
      ...content, 
      categoryId: (topic as any).categoryId, 
      categoryTitle: (topic as any).categoryTitle,
      topicId: topic.id,
      topicTitle: topic.title 
    }))
  );

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
        const data = {
          title: formData.title,
          content: formData.content,
          colorHex: formData.colorHex,
          icon: formData.icon,
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
          const data = {
            title: formData.title,
            content: formData.content,
            colorHex: formData.colorHex,
            icon: formData.icon,
          };
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
              label={`Topics (${topics.length})`} 
              iconPosition="start"
            />
            <Tab 
              icon={<ContentIcon />} 
              label={`Content (${content.length})`} 
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
                      {category.icon ? (
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
                        {topic.icon ? (
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
                        <Typography color="text.secondary">No topics yet. Create your first topic!</Typography>
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
              disabled={topics.length === 0}
            >
              Add Content
            </Button>
          </Box>

          {topics.length === 0 ? (
            <Alert severity="info">
              Create categories and topics first before adding content.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <ContentIcon sx={{ color: 'warning.main' }} />
                          <Typography>{item.title}</Typography>
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
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">No content yet. Create your first content item!</Typography>
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

            {(activeTab === 0 || activeTab === 1) && (
              <FormControl fullWidth>
                <InputLabel>Icon</InputLabel>
                <Select
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  label="Icon"
                >
                  <MenuItem value="">
                    <em>No Icon</em>
                  </MenuItem>
                  <MenuItem value="ic_math">📐 ic_math</MenuItem>
                  <MenuItem value="ic_science">🔬 ic_science</MenuItem>
                  <MenuItem value="ic_history">📚 ic_history</MenuItem>
                  <MenuItem value="ic_geography">🌍 ic_geography</MenuItem>
                  <MenuItem value="ic_english">📝 ic_english</MenuItem>
                  <MenuItem value="ic_physics">⚛️ ic_physics</MenuItem>
                  <MenuItem value="ic_chemistry">🧪 ic_chemistry</MenuItem>
                  <MenuItem value="ic_biology">🧬 ic_biology</MenuItem>
                  <MenuItem value="ic_computer">💻 ic_computer</MenuItem>
                  <MenuItem value="ic_art">🎨 ic_art</MenuItem>
                  <MenuItem value="ic_music">🎵 ic_music</MenuItem>
                  <MenuItem value="ic_sports">⚽ ic_sports</MenuItem>
                  <MenuItem value="ic_language">🌐 ic_language</MenuItem>
                  <MenuItem value="ic_economics">💰 ic_economics</MenuItem>
                  <MenuItem value="ic_philosophy">🤔 ic_philosophy</MenuItem>
                  <MenuItem value="ic_psychology">🧠 ic_psychology</MenuItem>
                  <MenuItem value="ic_literature">📖 ic_literature</MenuItem>
                  <MenuItem value="ic_engineering">⚙️ ic_engineering</MenuItem>
                  <MenuItem value="ic_medicine">⚕️ ic_medicine</MenuItem>
                  <MenuItem value="ic_law">⚖️ ic_law</MenuItem>
                </Select>
              </FormControl>
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
                    {topics
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

            <TextField
              fullWidth
              label="Color"
              type="color"
              value={formData.colorHex}
              onChange={(e) => setFormData(prev => ({ ...prev, colorHex: e.target.value }))}
            />

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