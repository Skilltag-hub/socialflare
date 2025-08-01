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

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" as SessionStrategy },
  callbacks: {
    async signIn({ user }: { user: any }) {
      // Simple sign-in - just allow all Google OAuth users
      return true;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};