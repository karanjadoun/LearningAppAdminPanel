import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { ContentNode, FirestoreContentNode } from '../types';

const MAIN_COLLECTION = 'learning_data'; // Change this to your actual collection name
const CHILDREN_COLLECTION = 'children';

export class ContentService {
  // Generate a URL-friendly slug from a title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Check if a document ID already exists and generate a unique one
  private async generateUniqueId(title: string, collectionPath: string[]): Promise<string> {
    const baseSlug = this.generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      try {
        const docRef = collectionPath.length === 1 
          ? doc(db, collectionPath[0], slug)
          : collectionPath.length === 3
          ? doc(db, collectionPath[0], collectionPath[1], collectionPath[2], slug)
          : doc(db, collectionPath[0], slug);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          console.log('✅ Generated unique ID:', slug);
          return slug;
        }
        
        // If document exists, try with a number suffix
        slug = `${baseSlug}-${counter}`;
        counter++;
        
        // Prevent infinite loops
        if (counter > 100) {
          // Fallback to timestamp
          slug = `${baseSlug}-${Date.now()}`;
          console.log('⚠️ Using timestamp fallback for ID:', slug);
          return slug;
        }
      } catch (error) {
        console.error('❌ Error checking document existence:', error);
        // Fallback to original slug
        return slug;
      }
    }
  }

  // Get all root categories
  async getRootCategories(): Promise<ContentNode[]> {
    try {
      console.log('🔍 Fetching from collection:', MAIN_COLLECTION);
      console.log('🔐 Current user:', auth.currentUser?.email);
      
      const categoriesRef = collection(db, MAIN_COLLECTION);
      
      // Test basic read access first
      console.log('🧪 Testing basic read access...');
      let snapshot;
      try {
        snapshot = await getDocs(categoriesRef);
        console.log('✅ Basic read successful, documents found:', snapshot.size);
        
        // Test reading the specific 'math' document we can see in the screenshot
        console.log('🧪 Testing specific document read...');
        const mathDocRef = doc(db, MAIN_COLLECTION, 'math');
        const mathDoc = await getDoc(mathDocRef);
        if (mathDoc.exists()) {
          console.log('✅ Math document found:', mathDoc.data());
        } else {
          console.log('❌ Math document not found');
        }
      } catch (basicError) {
        console.error('❌ Basic read failed:', basicError);
        throw basicError;
      }
      
      // If basic read works but we want ordering, try with orderBy
      if (snapshot.size > 0) {
        try {
          const q = query(categoriesRef, orderBy('order', 'asc'));
          const orderedSnapshot = await getDocs(q);
          snapshot = orderedSnapshot;
          console.log('✅ Ordered read successful');
        } catch (orderError) {
          console.warn('⚠️ OrderBy failed, using unordered results:', orderError);
          // Keep the original snapshot
        }
      }
      
      console.log('📊 Found documents:', snapshot.size);
      
      const categories: ContentNode[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as FirestoreContentNode;
        console.log('📄 Document:', doc.id, data);
        categories.push({
          id: doc.id,
          title: data.title,
          icon: data.icon,
          colorHex: data.colorHex,
          order: data.order || 0,
          isRoot: true,
          fullPath: [MAIN_COLLECTION, doc.id], // Document path: learning_data/categoryId (2 segments)
        });
      });
      
      console.log('✅ Categories loaded:', categories);
      return categories;
    } catch (error) {
      console.error('❌ Error fetching root categories:', error);
      throw error;
    }
  }

  // Get children of a specific node
  async getChildren(parentId: string, parentFullPath: string[] = []): Promise<ContentNode[]> {
    try {
      console.log(`🔍 Getting children for parentId: ${parentId}, parentFullPath:`, parentFullPath);
      
      let childrenRef;
      let childrenPath;
      
      if (parentFullPath.length === 2) {
        // Root category children: learning_data/categoryId/children
        childrenPath = [MAIN_COLLECTION, parentId, CHILDREN_COLLECTION];
        childrenRef = collection(db, MAIN_COLLECTION, parentId, CHILDREN_COLLECTION);
        console.log(`📁 Root category children path:`, childrenPath);
      } else if (parentFullPath.length === 4) {
        // Topic children: learning_data/categoryId/children/topicId/children  
        childrenPath = [...parentFullPath, CHILDREN_COLLECTION];
        childrenRef = collection(db, parentFullPath[0], parentFullPath[1], parentFullPath[2], parentFullPath[3], CHILDREN_COLLECTION);
        console.log(`📁 Topic children path:`, childrenPath);
      } else {
        throw new Error(`Invalid parent path length: ${parentFullPath.length}. Expected 2 or 4.`);
      }
      
      let snapshot;
      try {
        const q = query(childrenRef, orderBy('order', 'asc'));
        snapshot = await getDocs(q);
        console.log(`✅ Found ${snapshot.size} children with ordering`);
      } catch (orderError) {
        console.warn('⚠️ OrderBy failed, trying without ordering:', orderError);
        snapshot = await getDocs(childrenRef);
        console.log(`✅ Found ${snapshot.size} children without ordering`);
      }
      
      const children: ContentNode[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as FirestoreContentNode;
        console.log(`📄 Child document ${doc.id}:`, data);
        
        // Build the correct full path for this child document
        let childFullPath: string[];
        if (parentFullPath.length === 2) {
          // Child of root category: learning_data/categoryId/children/topicId
          childFullPath = [MAIN_COLLECTION, parentId, CHILDREN_COLLECTION, doc.id];
        } else {
          // Child of topic: learning_data/categoryId/children/topicId/children/contentId
          childFullPath = [...parentFullPath, CHILDREN_COLLECTION, doc.id];
        }
        
        const child: ContentNode = {
          id: doc.id,
          title: data.title,
          content: data.content,
          icon: data.icon,
          colorHex: data.colorHex,
          order: data.order || 0,
          parentId,
          fullPath: childFullPath,
          isRoot: false,
        };
        
        console.log(`✨ Created child node:`, {
          id: child.id,
          title: child.title,
          hasContent: !!child.content,
          fullPath: child.fullPath
        });
        
        children.push(child);
      });
      
      console.log(`📊 Total children loaded for ${parentId}:`, children.length);
      return children;
    } catch (error) {
      console.error(`❌ Error fetching children for ${parentId}:`, error);
      throw error;
    }
  }

  // Get full content tree
  async getContentTree(): Promise<ContentNode[]> {
    console.log('🌳 Building complete content tree...');
    const rootCategories = await this.getRootCategories();
    
    // Recursively load children for each node
    const loadChildren = async (node: ContentNode): Promise<ContentNode> => {
      console.log(`🔄 Loading children for node: ${node.title} (${node.id})`);
      console.log(`📍 Node path: ${node.fullPath?.join('/') || 'no path'}`);
      
      try {
        // Get children of this node using its fullPath
        const children = await this.getChildren(node.id, node.fullPath || []);
        console.log(`📁 Found ${children.length} children for ${node.title}`);
        
        if (children.length > 0) {
          // Recursively load children for each child
          const childrenWithSubChildren = await Promise.all(
            children.map(async (child) => {
              console.log(`🔄 Recursively loading for child: ${child.title}`);
              return await loadChildren(child);
            })
          );
          
          return {
            ...node,
            children: childrenWithSubChildren,
          };
        } else {
          console.log(`📭 No children found for ${node.title}`);
          return node;
        }
      } catch (error) {
        console.error(`❌ Error loading children for ${node.title}:`, error);
        return node; // Return node without children if there's an error
      }
    };
    
    console.log('🚀 Starting recursive loading for all root categories...');
    const treeWithChildren = await Promise.all(
      rootCategories.map(category => loadChildren(category))
    );
    
    console.log('✅ Complete content tree loaded:', treeWithChildren);
    return treeWithChildren;
  }

  // Create a new root category
  async createRootCategory(data: Omit<FirestoreContentNode, 'order'> & { order?: number }): Promise<string> {
    try {
      console.log('🆕 Creating root category with title:', data.title);
      
      // Generate unique ID based on title
      const uniqueId = await this.generateUniqueId(data.title, [MAIN_COLLECTION]);
      
      // Create document with custom ID
      const docRef = doc(db, MAIN_COLLECTION, uniqueId);
      await setDoc(docRef, {
        ...data,
        order: data.order || 0,
      });
      
      console.log('✅ Root category created with ID:', uniqueId);
      return uniqueId;
    } catch (error) {
      console.error('❌ Error creating root category:', error);
      throw error;
    }
  }

  // Create a child node
  async createChild(
    parentId: string,
    data: Omit<FirestoreContentNode, 'order'> & { order?: number },
    parentPath: string[] = []
  ): Promise<string> {
    try {
      console.log('💾 Creating child node:', { parentId, data, parentPath });
      
      let collectionPath: string[];
      
      if (parentPath.length === 0) {
        // Root level - creating under a main category
        collectionPath = [MAIN_COLLECTION, parentId, CHILDREN_COLLECTION];
      } else {
        // Nested level - parentPath should already include the full path to the children collection
        collectionPath = parentPath;
      }
      
      console.log('📁 Collection path:', collectionPath);
      console.log('💽 Data to save:', { ...data, order: data.order || 0 });
      
      // Generate unique ID based on title
      const uniqueId = await this.generateUniqueId(data.title, collectionPath);
      
      // Create document with custom ID
      let docRef;
      if (collectionPath.length === 3) {
        // Creating under a category: learning_data/categoryId/children/topicId
        docRef = doc(db, collectionPath[0], collectionPath[1], collectionPath[2], uniqueId);
      } else if (collectionPath.length === 5) {
        // Creating under a topic: learning_data/categoryId/children/topicId/children/contentId
        docRef = doc(db, collectionPath[0], collectionPath[1], collectionPath[2], collectionPath[3], collectionPath[4], uniqueId);
      } else {
        console.error('❌ Invalid collection path length:', collectionPath.length, collectionPath);
        throw new Error(`Invalid collection path length: ${collectionPath.length}. Expected 3 or 5.`);
      }
      

      
      await setDoc(docRef, {
        ...data,
        order: data.order || 0,
      });
      
      console.log('✅ Child document created with ID:', uniqueId);
      return uniqueId;
    } catch (error) {
      console.error('❌ Error creating child:', error);
      throw error;
    }
  }

  // Update a node
  async updateNode(
    nodeId: string,
    data: Partial<FirestoreContentNode>,
    nodePath?: string[]
  ): Promise<void> {
    try {
      console.log('📝 Updating node:', { nodeId, data, nodePath });
      
      let docRef;
      let fullPath: string[];
      
      if (nodePath && nodePath.length > 0) {
        // Use the provided node path (should be a document path with even number of segments)
        fullPath = nodePath;
        
        if (nodePath.length === 2) {
          // Category: learning_data/categoryId
          docRef = doc(db, nodePath[0], nodePath[1]);
        } else if (nodePath.length === 4) {
          // Topic: learning_data/categoryId/children/topicId
          docRef = doc(db, nodePath[0], nodePath[1], nodePath[2], nodePath[3]);
        } else if (nodePath.length === 6) {
          // Content: learning_data/categoryId/children/topicId/children/contentId
          docRef = doc(db, nodePath[0], nodePath[1], nodePath[2], nodePath[3], nodePath[4], nodePath[5]);
        } else {
          console.error('❌ Invalid node path length:', nodePath.length, nodePath);
          throw new Error(`Invalid node path length: ${nodePath.length}. Expected 2, 4, or 6.`);
        }
        
        console.log('📁 Using provided path:', fullPath);
      } else {
        // Fallback to root category path
        fullPath = [MAIN_COLLECTION, nodeId];
        docRef = doc(db, MAIN_COLLECTION, nodeId);
        console.log('📁 Using root category path:', fullPath);
      }
      
      console.log('💽 Data to update:', data);
      
      await updateDoc(docRef, data);
      console.log('✅ Node updated successfully');
    } catch (error) {
      console.error('❌ Error updating node:', error);
      console.error('❌ Failed path:', nodePath || [MAIN_COLLECTION, nodeId]);
      throw error;
    }
  }

  // Delete a node and all its subcollections recursively
  async deleteNode(nodeId: string, path: string[] = []): Promise<void> {
    try {
      console.log('🗑️ Starting delete operation for:', { nodeId, path });
      
      let docRef;
      let documentPath: string[];
      
      // Enhanced logic to handle both old and new data formats
      if (path.length === 0 || !path || path.length === 1) {
        // Root category or old data format
        console.log('📁 Treating as root category or old data format');
        documentPath = [MAIN_COLLECTION, nodeId];
        docRef = doc(db, MAIN_COLLECTION, nodeId);
      } else if (path.length === 2 && path[0] === MAIN_COLLECTION) {
        // Root category with proper path: ['learning_data', 'categoryId']
        console.log('📁 Root category with proper path');
        documentPath = path;
        docRef = doc(db, path[0], path[1]);
      } else if (path.length === 4) {
        // Topic: ['learning_data', 'categoryId', 'children', 'topicId']
        console.log('📂 Topic with proper path');
        documentPath = path;
        docRef = doc(db, path[0], path[1], path[2], path[3]);
      } else if (path.length === 6) {
        // Content: ['learning_data', 'categoryId', 'children', 'topicId', 'children', 'contentId']
        console.log('📄 Content with proper path');
        documentPath = path;
        docRef = doc(db, path[0], path[1], path[2], path[3], path[4], path[5]);
      } else {
        // Fallback: try to construct path or treat as root
        console.log('⚠️ Unknown path format, treating as root category');
        documentPath = [MAIN_COLLECTION, nodeId];
        docRef = doc(db, MAIN_COLLECTION, nodeId);
      }
      
      console.log('📍 Final document path:', documentPath.join('/'));
      
      // Try multiple deletion strategies for robustness
      await this.deleteNodeWithFallback(docRef, documentPath, nodeId);
      
      console.log('✅ Delete operation completed for:', nodeId);
    } catch (error) {
      console.error('❌ Error deleting node:', error);
      throw error;
    }
  }

  // Enhanced delete method with fallback strategies
  private async deleteNodeWithFallback(docRef: any, documentPath: string[], nodeId: string): Promise<void> {
    try {
      // First, recursively delete all subcollections
      await this.deleteAllSubcollections(documentPath);
      
      // Then delete the document itself
      console.log('🗑️ Deleting document:', documentPath.join('/'));
      await deleteDoc(docRef);
      
    } catch (error) {
      console.warn('⚠️ Primary delete failed, trying fallback approaches:', error);
      
      // Fallback 1: Try as root category
      if (documentPath.length !== 2 || documentPath[0] !== MAIN_COLLECTION) {
        console.log('🔄 Fallback 1: Trying as root category');
        try {
          const fallbackRef = doc(db, MAIN_COLLECTION, nodeId);
          await this.deleteAllSubcollections([MAIN_COLLECTION, nodeId]);
          await deleteDoc(fallbackRef);
          console.log('✅ Fallback 1 successful');
          return;
        } catch (fallback1Error) {
          console.warn('❌ Fallback 1 failed:', fallback1Error);
        }
      }
      
      // Fallback 2: Try to find the document by searching
      console.log('🔄 Fallback 2: Searching for document in database');
      try {
        const found = await this.findAndDeleteDocument(nodeId);
        if (found) {
          console.log('✅ Fallback 2 successful - found and deleted');
          return;
        }
      } catch (fallback2Error) {
        console.warn('❌ Fallback 2 failed:', fallback2Error);
      }
      
      // If all fallbacks fail, throw the original error
      throw error;
    }
  }

  // Search for and delete a document by ID across the database
  private async findAndDeleteDocument(nodeId: string): Promise<boolean> {
    try {
      // First check root categories
      const rootRef = doc(db, MAIN_COLLECTION, nodeId);
      const rootSnap = await getDoc(rootRef);
      
      if (rootSnap.exists()) {
        console.log('📁 Found as root category:', nodeId);
        await this.deleteAllSubcollections([MAIN_COLLECTION, nodeId]);
        await deleteDoc(rootRef);
        return true;
      }
      
      // Search in subcollections
      const categoriesRef = collection(db, MAIN_COLLECTION);
      const categoriesSnapshot = await getDocs(categoriesRef);
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        // Check in category/children/
        try {
          const topicRef = doc(db, MAIN_COLLECTION, categoryDoc.id, CHILDREN_COLLECTION, nodeId);
          const topicSnap = await getDoc(topicRef);
          
          if (topicSnap.exists()) {
            console.log('📂 Found as topic:', nodeId, 'in category:', categoryDoc.id);
            await this.deleteAllSubcollections([MAIN_COLLECTION, categoryDoc.id, CHILDREN_COLLECTION, nodeId]);
            await deleteDoc(topicRef);
            return true;
          }
          
          // Check in category/children/topic/children/
          const topicsRef = collection(db, MAIN_COLLECTION, categoryDoc.id, CHILDREN_COLLECTION);
          const topicsSnapshot = await getDocs(topicsRef);
          
          for (const topicDoc of topicsSnapshot.docs) {
            try {
              const contentRef = doc(db, MAIN_COLLECTION, categoryDoc.id, CHILDREN_COLLECTION, topicDoc.id, CHILDREN_COLLECTION, nodeId);
              const contentSnap = await getDoc(contentRef);
              
              if (contentSnap.exists()) {
                console.log('📄 Found as content:', nodeId, 'in topic:', topicDoc.id, 'category:', categoryDoc.id);
                await deleteDoc(contentRef);
                return true;
              }
            } catch (contentError) {
              // Continue searching
            }
          }
        } catch (topicError) {
          // Continue searching
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error in findAndDeleteDocument:', error);
      return false;
    }
  }

  // Recursively delete all subcollections of a document
  private async deleteAllSubcollections(documentPath: string[]): Promise<void> {
    try {
      console.log('🔍 Checking for subcollections in:', documentPath.join('/'));
      
      // Check if this document has a 'children' subcollection
      const childrenCollectionPath = [...documentPath, CHILDREN_COLLECTION];
      let childrenRef;
      
      // Handle different path lengths
      if (documentPath.length === 2) {
        // Root category: learning_data/categoryId/children
        childrenRef = collection(db, documentPath[0], documentPath[1], CHILDREN_COLLECTION);
      } else if (documentPath.length === 4) {
        // Topic: learning_data/categoryId/children/topicId/children
        childrenRef = collection(db, documentPath[0], documentPath[1], documentPath[2], documentPath[3], CHILDREN_COLLECTION);
      } else {
        // Unknown format, skip subcollection deletion
        console.log('⚠️ Unknown document path format, skipping subcollection deletion');
        return;
      }
      
      try {
        const childrenSnapshot = await getDocs(childrenRef);
        
        if (childrenSnapshot.size > 0) {
          console.log(`🗑️ Found ${childrenSnapshot.size} children to delete in:`, childrenCollectionPath.join('/'));
          
          // Delete each child document and its subcollections
          const deletePromises = childrenSnapshot.docs.map(async (childDoc) => {
            const childDocumentPath = [...childrenCollectionPath, childDoc.id];
            console.log('🗑️ Deleting child document:', childDocumentPath.join('/'));
            
            // Recursively delete the child's subcollections first
            await this.deleteAllSubcollections(childDocumentPath);
            
            // Then delete the child document
            let deleteDocRef;
            if (childDocumentPath.length === 3) {
              // category/children/topic
              deleteDocRef = doc(db, childDocumentPath[0], childDocumentPath[1], childDocumentPath[2]);
            } else if (childDocumentPath.length === 5) {
              // category/children/topic/children/content
              deleteDocRef = doc(db, childDocumentPath[0], childDocumentPath[1], childDocumentPath[2], childDocumentPath[3], childDocumentPath[4]);
            } else {
              console.warn('⚠️ Unexpected child document path length:', childDocumentPath.length);
              return; // Skip this child
            }
            
            if (deleteDocRef) {
              await deleteDoc(deleteDocRef);
              console.log('✅ Child document deleted:', childDoc.id);
            }
          });
          
          await Promise.all(deletePromises);
          console.log('✅ All children deleted for:', documentPath.join('/'));
        } else {
          console.log('📭 No children found in:', childrenCollectionPath.join('/'));
        }
      } catch (childrenError) {
        // If we can't read the children collection, it might not exist, which is fine
        console.log('📭 Children collection does not exist or is empty:', childrenCollectionPath.join('/'));
      }
    } catch (error) {
      console.error('❌ Error deleting subcollections:', error);
      // Don't throw error here, continue with parent deletion
      console.log('⚠️ Continuing with parent deletion despite subcollection error');
    }
  }

  // Get content statistics
  async getContentStats() {
    try {
      console.log('📈 Calculating content statistics...');
      
      // Use the existing tree loading logic to avoid path building issues
      const contentTree = await this.getContentTree();
      
      let totalTopics = 0;
      let totalContent = 0;
      
      // Recursively count nodes in the tree
      const countInTree = (nodes: ContentNode[]): { topics: number; content: number } => {
        let topics = 0;
        let content = 0;
        
        for (const node of nodes) {
          if (node.isRoot) {
            // Skip root categories, they're counted separately
          } else if (node.content) {
            // This is a content item
            content++;
          } else {
            // This is a topic
            topics++;
          }
          
          // Recursively count children
          if (node.children && node.children.length > 0) {
            const childStats = countInTree(node.children);
            topics += childStats.topics;
            content += childStats.content;
          }
        }
        
        return { topics, content };
      };
      
      const stats = countInTree(contentTree);
      totalTopics = stats.topics;
      totalContent = stats.content;
      
      console.log('📊 Statistics calculated:', {
        categories: contentTree.length,
        topics: totalTopics,
        content: totalContent
      });
      
      return {
        totalCategories: contentTree.length,
        totalTopics,
        totalContent,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('❌ Error getting content stats:', error);
      throw error;
    }
  }
}

export const contentService = new ContentService(); 