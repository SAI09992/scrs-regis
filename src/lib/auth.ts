import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

const DEFAULT_ADMIN_EMAILS = [
  '99230040782@klu.ac.in',
  '99230040792@klu.ac.in',
  'scrs@klu.ac.in',
  'edusaidhanush@gmail.com',
  'admin@nextgensoc.io',
  'soc-lead@nextgensoc.io',
  'saidh@example.com',
];

export function getAdminEmails(): string[] {
  const envList = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const combined = Array.from(new Set([...DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()), ...envList]));
  return combined;
}

export function isMasterAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return getAdminEmails().includes(cleanEmail);
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'nextgen_soc_super_secure_secret_key_2026',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          hd: 'klu.ac.in',
          prompt: 'select_account',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      const email = user.email.toLowerCase();
      const isMasterAdmin = isMasterAdminEmail(email);

      // Enforce @klu.ac.in domain check for non-master admins
      if (!isMasterAdmin && !email.endsWith('@klu.ac.in')) {
        console.warn(`Access denied for ${email}: Only @klu.ac.in email addresses are permitted.`);
        return '/login?error=InvalidDomain';
      }

      try {
        const existing = await db
          .select()
          .from(users)
          .where(sql`LOWER(${users.email}) = ${email}`)
          .limit(1);

        if (existing.length === 0) {
          const newId = `usr_${Math.random().toString(36).substring(2, 10)}`;
          await db.insert(users).values({
            id: newId,
            googleId: account?.providerAccountId || (profile as any)?.sub || `g_${newId}`,
            email,
            name: user.name || 'Participant',
            profileImage:
              user.image ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name || email)}`,
            role: isMasterAdmin ? 'admin' : 'participant',
          });
        } else {
          if (isMasterAdmin && existing[0].role !== 'admin') {
            await db.update(users).set({ role: 'admin' }).where(eq(users.id, existing[0].id));
          }
        }
        return true;
      } catch (err) {
        console.error('Error recording sign-in user in DB:', err);
        return true;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      const email = (token.email || user?.email || '').toLowerCase();
      if (isMasterAdminEmail(email)) {
        token.role = 'admin';
        return token;
      }

      // Check database role
      if (email) {
        try {
          const dbUser = await db
            .select({ role: users.role })
            .from(users)
            .where(sql`LOWER(${users.email}) = ${email}`)
            .limit(1);

          if (dbUser.length > 0 && dbUser[0].role === 'admin') {
            token.role = 'admin';
            return token;
          }
        } catch (e) {
          // fallback
        }
      }

      if (!token.role) {
        token.role = (user as any)?.role || 'participant';
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        const email = (session.user.email || '').toLowerCase();
        (session.user as any).role = isMasterAdminEmail(email) ? 'admin' : (token.role as string) || 'participant';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

export async function getAuthSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getAuthSession();
  if (!session?.user?.email) return null;

  const email = session.user.email.toLowerCase();
  const isMasterAdmin = isMasterAdminEmail(email);

  let role: 'admin' | 'participant' = isMasterAdmin
    ? 'admin'
    : (((session.user as any).role as 'admin' | 'participant') || 'participant');

  if (role !== 'admin') {
    try {
      const dbUser = await db
        .select({ role: users.role })
        .from(users)
        .where(sql`LOWER(${users.email}) = ${email}`)
        .limit(1);
      if (dbUser.length > 0 && dbUser[0].role === 'admin') {
        role = 'admin';
      }
    } catch (e) {
      // ignore
    }
  }

  return {
    id: (session.user as any).id || `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email,
    name: session.user.name || 'User',
    profileImage: session.user.image || null,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    googleId: null,
  };
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('UNAUTHORIZED_ADMIN_REQUIRED');
  }
  return user;
}
