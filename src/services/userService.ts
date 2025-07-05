import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  createdAt: any;
  lastSignInAt: any;
  providerData: any[];
  isActive?: boolean;
  lastActivity?: any;
}

export interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  activeThisWeek: number;
  unverifiedUsers: number;
}

class UserService {
  private readonly USERS_COLLECTION = 'users';

  /**
   * Get all users from Firestore, sorted by lastSignInAt (most recent first)
   */
  async getUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, this.USERS_COLLECTION);
      const q = query(usersRef, orderBy('lastSignInAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          photoURL: data.photoURL || '',
          emailVerified: data.emailVerified || false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          lastSignInAt: data.lastSignInAt?.toDate ? data.lastSignInAt.toDate() : data.lastSignInAt,
          providerData: data.providerData || [],
          isActive: data.isActive !== undefined ? data.isActive : true,
          lastActivity: data.lastActivity?.toDate ? data.lastActivity.toDate() : data.lastActivity,
        });
      });
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const users = await this.getUsers();
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        totalUsers: users.length,
        verifiedUsers: users.filter(user => user.emailVerified).length,
        activeThisWeek: users.filter(user => {
          const lastSignIn = new Date(user.lastSignInAt);
          return lastSignIn >= oneWeekAgo;
        }).length,
        unverifiedUsers: users.filter(user => !user.emailVerified).length,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  async getUserById(uid: string): Promise<User | null> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          uid: userSnap.id,
          email: data.email || '',
          displayName: data.displayName || '',
          photoURL: data.photoURL || '',
          emailVerified: data.emailVerified || false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          lastSignInAt: data.lastSignInAt?.toDate ? data.lastSignInAt.toDate() : data.lastSignInAt,
          providerData: data.providerData || [],
          isActive: data.isActive !== undefined ? data.isActive : true,
          lastActivity: data.lastActivity?.toDate ? data.lastActivity.toDate() : data.lastActivity,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const users = await this.getUsers();
      const lowerSearchTerm = searchTerm.toLowerCase();
      return users.filter(user =>
        user.displayName.toLowerCase().includes(lowerSearchTerm) ||
        user.email.toLowerCase().includes(lowerSearchTerm)
      );
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }
}

export default new UserService(); 