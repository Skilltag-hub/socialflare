import GoogleProvider from "next-auth/providers/google";
import { MongoClient } from "mongodb";
import { SessionStrategy } from "next-auth";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "waitlist";

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  if (!uri) throw new Error("MONGODB_URI not set");
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

// Helper function to check if email is a company email
const isCompanyEmail = (email: string) => {
  // Add any company email domain checks here if needed
  return true; // For now, allow any email
};

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: { 
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any; profile: any }) {
      if (account?.provider === 'google') {
        const client = await connectToDatabase();
        const db = client.db(dbName);

        // Check if this is a company login
        if (isCompanyEmail(user.email)) {
          // For companies, just ensure the record exists (handled in the companies API)
          return true;
        }

        // Regular user flow
        const existingUser = await db.collection("users").findOne({ email: user.email });

        if (existingUser) {
          const setupComplete = !!(
            existingUser.pin &&
            existingUser.phone &&
            existingUser.institution
          );
          return setupComplete;
        } else {
          await db.collection("users").updateOne(
            { email: user.email },
            {
              $setOnInsert: {
                email: user.email,
                name: user.name,
                image: user.image,
                pin: null,
                institution: "",
                state: "",
                graduationYear: "",
                idImageUrl: "",
                phone: "",
                description: "",
                status: "available",
                skills: [],
                gender: "",
                dateOfBirth: null,
                referredPeople: [],
                referredBy: null,
                createdAt: new Date(),
                updatedAt: new Date()
              },
            },
            { upsert: true }
          );
          return true;
        }
      }
      return true;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token;
        token.id = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
