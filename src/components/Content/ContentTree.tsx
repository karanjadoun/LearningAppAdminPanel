import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
  Card,
  CardContent,
  Collapse,
  Button,
} from '@mui/material';
import {
  MoreVert,
  Add,
  Edit,
  Delete,
  FolderOpen,
  Topic,
  Article,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ContentNode } from '../../types';
import { contentService } from '../../services/contentService';

interface ContentTreeProps {
  onEdit: (node: ContentNode) => void;
  onDelete: (node: ContentNode) => void;
  onAddChild: (parentNode: ContentNode) => void;
  onAddCategory: () => void;
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
}

const ContentTree: React.FC<ContentTreeProps> = ({
  onEdit,
  onDelete,
  onAddChild,
  onAddCategory,
  selectedNodeId,
  onNodeSelect,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNode, setSelectedNode] = useState<ContentNode | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const {
    data: contentTree,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['contentTree'],
    queryFn: () => contentService.getContentTree(),
  });

  // Auto-expand all nodes when data loads
  React.useEffect(() => {
    if (contentTree) {
      const expandedState: Record<string, boolean> = {};
      const expandAll = (nodes: ContentNode[]) => {
        nodes.forEach(node => {
          expandedState[node.id] = true;
          if (node.children && node.children.length > 0) {
            expandAll(node.children);
          }
        });
      };
      expandAll(contentTree);
      setExpanded(expandedState);
    }
  }, [contentTree]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, node: ContentNode) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedNode(node);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNode(null);
  };

  const handleEdit = () => {
    if (selectedNode) {
      onEdit(selectedNode);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedNode) {
      onDelete(selectedNode);
    }
    handleMenuClose();
  };

  const handleAddChild = () => {
    if (selectedNode) {
      console.log('🌳 Tree: Adding child to node:', {
        id: selectedNode.id,
        title: selectedNode.title,
        fullPath: selectedNode.fullPath,
        isRoot: selectedNode.isRoot
      });
      onAddChild(selectedNode);
    }
    handleMenuClose();
  };

  const toggleExpanded = (nodeId: string) => {
    setExpanded(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const getNodeIcon = (node: ContentNode, isSelected: boolean = false) => {
    const iconStyle = { 
      fontSize: 24, 
      color: isSelected ? 'inherit' : undefined
    };
    
    if (node.content) {
      return <Article sx={{ ...iconStyle, color: isSelected ? 'inherit' : 'warning.main' }} />;
    } else if (node.isRoot) {
      return <FolderOpen sx={{ ...iconStyle, color: isSelected ? 'inherit' : 'primary.main' }} />;
    } else {
      return <Topic sx={{ ...iconStyle, color: isSelected ? 'inherit' : 'success.main' }} />;
    }
  };

  const getNodeTypeInfo = (node: ContentNode) => {
    if (node.content) {
      return { label: 'Content', color: 'warning', bgColor: '#fff3e0' };
    } else if (node.isRoot) {
      return { label: 'Category', color: 'primary', bgColor: '#e3f2fd' };
    } else {
      return { label: 'Topic', color: 'success', bgColor: '#e8f5e8' };
    }
  };

  const renderTreeNode = (node: ContentNode, depth: number = 0): React.ReactElement => {
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id];
    const typeInfo = getNodeTypeInfo(node);

    // Debug logging for troubleshooting
    if (node.children && node.children.length > 0) {
      console.log(`🌳 ${node.title} has ${node.children.length} children:`, 
        node.children.map(c => ({ title: c.title, hasContent: !!c.content }))
      );
    }

    return (
      <Box key={node.id} sx={{ mb: 1 }}>
        {/* Main Node Card */}
        <Card
          elevation={isSelected ? 4 : 1}
          sx={{
            ml: depth * 2.5,
            cursor: 'pointer',
            border: isSelected ? 2 : 1,
            borderColor: isSelected ? 'primary.main' : 'divider',
            backgroundColor: isSelected ? 'primary.main' : typeInfo.bgColor,
            color: isSelected ? 'primary.contrastText' : 'text.primary',
            transition: 'all 0.2s ease-in-out',
            minHeight: 'auto',
            '&:hover': {
              elevation: 3,
              transform: 'translateY(-1px)',
              borderColor: isSelected ? 'primary.dark' : 'primary.light',
            },
          }}
          onClick={() => onNodeSelect(node.id)}
        >
          <CardContent sx={{ py: 2.5, px: 3, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Expand/Collapse Button */}
              {hasChildren ? (
                <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
                  <IconButton
                    size="medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(node.id);
                    }}
                    sx={{ 
                      color: 'inherit',
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '&:hover': { 
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                  </IconButton>
                </Tooltip>
              ) : (
                <Box sx={{ width: 48, display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ 
                    width: 2, 
                    height: 20, 
                    backgroundColor: 'divider',
                    opacity: 0.3 
                  }} />
                </Box>
              )}

              {/* Node Icon */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getNodeIcon(node, isSelected)}
              </Box>

              {/* Node Content */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                  <Tooltip title={node.title} placement="top">
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: depth === 0 ? '1.1rem' : '1rem',
                        color: 'inherit',
                        flexGrow: 1,
                        lineHeight: 1.3,
                        wordBreak: 'break-word',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        maxWidth: '380px',
                      }}
                    >
                      {node.title}
                    </Typography>
                  </Tooltip>
                  
                  <Chip 
                    label={typeInfo.label}
                    size="small"
                    sx={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${typeInfo.color}.main`,
                      color: isSelected ? 'inherit' : `${typeInfo.color}.contrastText`,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      flexShrink: 0,
                      alignSelf: 'flex-start',
                      mt: 0.25,
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  {hasChildren && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'inherit',
                        opacity: 0.8,
                        fontSize: '0.8rem',
                      }}
                    >
                      📁 {node.children!.length} item{node.children!.length !== 1 ? 's' : ''}
                    </Typography>
                  )}
                  
                  {node.colorHex && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          backgroundColor: node.colorHex,
                          border: 2,
                          borderColor: isSelected ? 'primary.contrastText' : 'background.paper',
                          boxShadow: 1,
                        }} 
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.7rem',
                          color: 'inherit',
                          opacity: 0.7,
                          fontFamily: 'monospace',
                        }}
                      >
                        {node.colorHex}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Menu Button */}
              <Tooltip title="More options">
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, node)}
                  sx={{ 
                    color: 'inherit',
                    '&:hover': { 
                      backgroundColor: 'rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <MoreVert />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>

        {/* Children */}
        {hasChildren && (
          <Collapse in={isExpanded} timeout={300}>
            <Box sx={{ mt: 1 }}>
              {node.children!.map((child) => renderTreeNode(child, depth + 1))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        p: 4,
        gap: 2,
      }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Loading content structure...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          m: 2,
          borderRadius: 2,
        }}
        action={
          <Button 
            size="small" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['contentTree'] })}
          >
            Retry
          </Button>
        }
      >
        <Typography variant="body2">
          Error loading content tree. Please try again.
        </Typography>
      </Alert>
    );
  }

  if (!contentTree || contentTree.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        p: 4,
        gap: 3,
        textAlign: 'center',
      }}>
        <FolderOpen sx={{ fontSize: 64, color: 'text.disabled' }} />
        <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600 }}>
          No Content Yet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Start by creating your first category to organize your learning content
        </Typography>
        <Button 
          variant="contained"
          startIcon={<Add />}
          onClick={onAddCategory}
          size="large"
          sx={{ 
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
          }}
        >
          Create Your First Category
        </Button>
      </Box>
    );
  }

  console.log('🌳 ContentTree loaded:', contentTree?.length || 0, 'categories');

  return (
    <Box sx={{ 
      height: '100%', 
      overflow: 'auto',
      p: 2.5,
      backgroundColor: 'background.default',
    }}>
      {contentTree.map((node) => renderTreeNode(node))}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 12,
          sx: {
            minWidth: 200,
            borderRadius: 3,
            mt: 1,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <MenuItem 
          onClick={handleEdit}
          sx={{ 
            py: 1.5, 
            px: 2,
            borderRadius: 1,
            mx: 1,
            my: 0.5,
            '&:hover': { 
              backgroundColor: 'primary.light', 
              color: 'primary.contrastText' 
            }
          }}
        >
          <Edit sx={{ mr: 2, fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Edit {selectedNode?.content ? 'Content' : selectedNode?.isRoot ? 'Category' : 'Topic'}
          </Typography>
        </MenuItem>
        {!selectedNode?.content && (
          <MenuItem 
            onClick={handleAddChild}
            sx={{ 
              py: 1.5,
              px: 2,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              '&:hover': { 
                backgroundColor: 'success.light', 
                color: 'success.contrastText' 
              }
            }}
          >
            <Add sx={{ mr: 2, fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Add {selectedNode?.isRoot ? 'Topic' : 'Content'}
            </Typography>
          </MenuItem>
        )}
        <Divider sx={{ my: 1 }} />
        <MenuItem 
          onClick={handleDelete}
          sx={{ 
            py: 1.5,
            px: 2,
            borderRadius: 1,
            mx: 1,
            my: 0.5,
            '&:hover': { 
              backgroundColor: 'error.light', 
              color: 'error.contrastText' 
            }
          }}
        >
          <Delete sx={{ mr: 2, fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Delete
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ContentTree; 