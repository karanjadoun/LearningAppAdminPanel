import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ContentNode } from '../types';
import { contentService } from '../services/contentService';

interface SearchResult {
  id: string;
  title: string;
  content?: string;
  type: 'category' | 'topic' | 'content';
  path: string[];
  fullPath: string[];
}

interface SearchContextType {
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  showSearchResults: boolean;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  searchContent: (query: string) => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchContent(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchContent = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const contentTree = await contentService.getContentTree();
      const results = searchInContentTree(contentTree, query.toLowerCase());
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchInContentTree = (nodes: ContentNode[], query: string): SearchResult[] => {
    const results: SearchResult[] = [];

    const searchNode = (node: ContentNode, path: string[] = []) => {
      const currentPath = [...path, node.title];
      
      // Check if title matches
      const titleMatch = node.title.toLowerCase().includes(query);
      
      // Check if content matches (for content nodes)
      const contentMatch = node.content && 
        stripHtml(node.content).toLowerCase().includes(query);

      if (titleMatch || contentMatch) {
        results.push({
          id: node.id,
          title: node.title,
          content: node.content ? stripHtml(node.content).substring(0, 200) + '...' : undefined,
          type: node.content ? 'content' : node.isRoot ? 'category' : 'topic',
          path: currentPath,
          fullPath: node.fullPath || [],
        });
      }

      // Search in children
      if (node.children) {
        node.children.forEach(child => searchNode(child, currentPath));
      }
    };

    nodes.forEach(node => searchNode(node));
    return results;
  };

  const stripHtml = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      clearSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setIsSearching(false);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        isSearching,
        showSearchResults,
        setSearchQuery: handleSetSearchQuery,
        clearSearch,
        searchContent,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}; 