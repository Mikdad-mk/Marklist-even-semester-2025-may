import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  roles?: string[]
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = req.cookies.auth;
      if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const decoded = verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
      };

      // Check if user has required role
      if (roles && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

// Helper function to check if user is admin
export function isAdmin(req: AuthenticatedRequest): boolean {
  return req.user?.role === 'admin';
}

// Helper function to check if user is teacher
export function isTeacher(req: AuthenticatedRequest): boolean {
  return req.user?.role === 'teacher';
}

// Helper function to check if user is approved teacher
export async function isApprovedTeacher(req: AuthenticatedRequest): Promise<boolean> {
  if (!isTeacher(req)) return false;
  
  const response = await fetch('/api/auth/me');
  if (!response.ok) return false;
  
  const userData = await response.json();
  return userData.isApproved;
} 