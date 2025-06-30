import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  IconButton,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  FolderOpen,
  Article,
  Topic as TopicIcon,
} from '@mui/icons-material';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import ContentTree from '../components/Content/ContentTree';
import ContentEditor from '../components/Content/ContentEditor';
import { ContentNode, FirestoreContentNode } from '../types';
import { contentService } from '../services/contentService';

const ContentManagement: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentNode, setCurrentNode] = useState<ContentNode | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [nodeType, setNodeType] = useState<'category' | 'topic' | 'content'>('category');
  const [parentNode, setParentNode] = useState<ContentNode | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const queryClient = useQueryClient();

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    queryClient.invalidateQueries({ queryKey: ['contentStats'] });
  };

  // Handle creating a new category
  const handleAddCategory = () => {
    setCurrentNode(null);
    setParentNode(null);
    setEditorMode('create');
    setNodeType('category');
    setEditorOpen(true);
  };

  // Handle editing a node
  const handleEdit = (node: ContentNode) => {
    setCurrentNode(node);
    setParentNode(null);
    setEditorMode('edit');
    
    if (node.isRoot) {
      setNodeType('category');
    } else if (node.content) {
      setNodeType('content');
    } else {
      setNodeType('topic');
    }
    
    setEditorOpen(true);
  };

  // Handle adding a child to a node
  const handleAddChild = (parent: ContentNode) => {
    console.log('➕ Adding child to parent:', parent);
    
    setCurrentNode(null);
    setParentNode(parent);
    setEditorMode('create');
    
    // Determine what type of child to create
    if (parent.isRoot) {
      setNodeType('topic');
      console.log('📂 Creating topic under root category');
    } else {
      setNodeType('content');
      console.log('📄 Creating content under topic');
    }
    
    setEditorOpen(true);
  };

  // Handle delete confirmation
  const handleDelete = (node: ContentNode) => {
    setCurrentNode(node);
    setDeleteDialogOpen(true);
  };

  // Confirm delete operation
  const confirmDelete = async () => {
    if (!currentNode) return;

    try {
      console.log('🗑️ Deleting node:', {
        id: currentNode.id,
        title: currentNode.title,
        fullPath: currentNode.fullPath,
        isRoot: currentNode.isRoot
      });

      // Pass the full path for nested nodes, empty array for root categories
      const pathToUse = currentNode.fullPath && currentNode.fullPath.length > 0 
        ? currentNode.fullPath 
        : [];
      
      await contentService.deleteNode(currentNode.id, pathToUse);
      showSnackbar(`${currentNode.content ? 'Content' : currentNode.isRoot ? 'Category' : 'Topic'} deleted successfully`, 'success');
      refreshData();
      setDeleteDialogOpen(false);
      setCurrentNode(null);
      
      // Clear selection if the deleted node was selected
      if (selectedNodeId === currentNode.id) {
        setSelectedNodeId('');
      }
    } catch (error) {
      console.error('❌ Error deleting node:', error);
      showSnackbar('Error deleting item. Please try again.', 'error');
    }
  };

  // Handle save from editor
  const handleSave = async (data: Partial<FirestoreContentNode>) => {
    try {
      console.log('🎯 Save triggered:', { 
        editorMode, 
        nodeType, 
        parentNode: parentNode?.id, 
        parentFullPath: parentNode?.fullPath,
        currentNode: currentNode?.id,
        data 
      });
      
      if (editorMode === 'create') {
        if (parentNode) {
          // Creating a child - use parent's full path to determine where to save
          console.log('👶 Creating child under parent:', parentNode.id, 'at path:', parentNode.fullPath);
          
          // Calculate the parent path for the new child
          // If parentNode has a fullPath, we need to add 'children' to get to the children collection
          const parentPath = parentNode.fullPath ? [...parentNode.fullPath, 'children'] : [];
          console.log('📁 Calculated parent path for new child:', parentPath);
          
          await contentService.createChild(parentNode.id, data as Omit<FirestoreContentNode, 'order'>, parentPath);
          showSnackbar('Item created successfully', 'success');
        } else {
          // Creating a root category
          console.log('🌳 Creating root category');
          await contentService.createRootCategory(data as Omit<FirestoreContentNode, 'order'>);
          showSnackbar('Category created successfully', 'success');
        }
      } else {
        // Editing existing node
        if (currentNode) {
          console.log('✏️ Editing existing node:', currentNode.id, 'with path:', currentNode.fullPath);
          await contentService.updateNode(currentNode.id, data, currentNode.fullPath);
          showSnackbar('Item updated successfully', 'success');
        }
      }
      
      refreshData();
      setEditorOpen(false);
    } catch (error) {
      console.error('❌ Error saving content:', error);
      showSnackbar('Error saving item. Please try again.', 'error');
      throw error; // Re-throw to let the editor handle it
    }
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 72px)', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'background.default',
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 4, 
        borderBottom: '1px solid', 
        borderColor: 'grey.200',
        backgroundColor: 'background.paper',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              Content Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
              Create and organize your learning content with our intuitive editor
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddCategory}
            sx={{ 
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            New Category
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', gap: 3, p: 3 }}>
        {/* Sidebar - Content Tree */}
        <Box sx={{ 
          width: 480, 
          borderRadius: 3,
          border: '1px solid', 
          borderColor: 'grey.200',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}>
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid', 
            borderColor: 'grey.200',
            backgroundColor: 'grey.50',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              📚 Content Structure
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Organize your learning materials
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <ContentTree
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddChild={handleAddChild}
              onAddCategory={handleAddCategory}
              selectedNodeId={selectedNodeId}
              onNodeSelect={setSelectedNodeId}
            />
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          borderRadius: 3,
          border: '1px solid', 
          borderColor: 'grey.200',
          backgroundColor: 'background.paper',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}>
          <ContentPreviewArea 
            selectedNodeId={selectedNodeId} 
            onEdit={handleEdit} 
            onNodeSelect={setSelectedNodeId}
          />
        </Box>
      </Box>

      {/* Content Editor Dialog */}
      <ContentEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        node={currentNode || undefined}
        mode={editorMode}
        nodeType={nodeType}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{currentNode?.title}"? 
            {!currentNode?.content && " This will also delete all child items."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Content Preview Area Component
const ContentPreviewArea: React.FC<{
  selectedNodeId: string;
  onEdit: (node: any) => void;
  onNodeSelect: (nodeId: string) => void;
}> = ({ selectedNodeId, onEdit, onNodeSelect }) => {
  const { data: contentTree } = useQuery({
    queryKey: ['contentTree'],
    queryFn: () => contentService.getContentTree(),
  });

  // Find the selected node in the tree
  const findNodeById = (nodes: ContentNode[], id: string): ContentNode | null => {
    for (const node of nodes) {
      if (node.id === id) {
        console.log('🎯 Found selected node:', node);
        return node;
      }
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = contentTree ? findNodeById(contentTree, selectedNodeId) : null;
  console.log('🔍 Selected node ID:', selectedNodeId, 'Found node:', selectedNode);

  if (!selectedNode) {
    return (
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'grey.50'
      }}>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <FolderOpen sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Select Content to Preview
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Choose an item from the content tree to view and edit its details
          </Typography>
          <Box sx={{ 
            p: 3, 
            backgroundColor: 'background.paper', 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Content Types:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FolderOpen sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2">Categories - Main subjects</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TopicIcon sx={{ fontSize: 20, color: 'success.main' }} />
                <Typography variant="body2">Topics - Subtopics</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Article sx={{ fontSize: 20, color: 'warning.main' }} />
                <Typography variant="body2">Content - Learning materials</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  const getNodeIcon = (node: ContentNode) => {
    if (node.content) return <Article sx={{ color: 'warning.main' }} />;
    if (node.isRoot) return <FolderOpen sx={{ color: 'primary.main' }} />;
    return <TopicIcon sx={{ color: 'success.main' }} />;
  };

  const getNodeType = (node: ContentNode) => {
    if (node.content) return 'Content';
    if (node.isRoot) return 'Category';
    return 'Topic';
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {getNodeIcon(selectedNode)}
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {selectedNode.title}
              </Typography>
              <Chip 
                label={getNodeType(selectedNode)} 
                size="small" 
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Box>
            {selectedNode.colorHex && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Box 
                  sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    backgroundColor: selectedNode.colorHex,
                    border: '1px solid',
                    borderColor: 'divider'
                  }} 
                />
                <Typography variant="body2" color="text.secondary">
                  {selectedNode.colorHex}
                </Typography>
              </Box>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => onEdit(selectedNode)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Edit
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {selectedNode.content ? (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                📄 Content Preview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box 
                sx={{ 
                  maxHeight: 500, 
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 3,
                  backgroundColor: 'background.paper'
                }}
                dangerouslySetInnerHTML={{ __html: selectedNode.content }}
              />
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              {getNodeIcon(selectedNode)}
              <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 600 }}>
                {getNodeType(selectedNode)} Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedNode.isRoot 
                  ? 'This category contains topics and learning materials'
                  : 'This topic can contain learning content and materials'
                }
              </Typography>
              {selectedNode.children && selectedNode.children.length > 0 && (
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                  💡 Expand "{selectedNode.title}" in the tree to see its {selectedNode.children.length} item(s)
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Children Summary */}
        {selectedNode.children && selectedNode.children.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                📂 Contains {selectedNode.children.length} item(s)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click on any item below to view its details:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {selectedNode.children.map((child) => (
                  <Chip
                    key={child.id}
                    label={child.title}
                    variant={child.content ? "filled" : "outlined"}
                    size="medium"
                    icon={child.content ? <Article /> : <TopicIcon />}
                    clickable
                    onClick={() => onNodeSelect(child.id)}
                    sx={{
                      '&:hover': {
                        backgroundColor: child.content ? 'warning.light' : 'success.light',
                        color: 'white'
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default ContentManagement; 