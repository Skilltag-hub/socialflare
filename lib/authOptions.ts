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
  callback: {
    // SignIn callback for managing user sign-in and redirection logic
    async signIn({ user }: { user: any }) {
      const client = await connectToDatabase();
      const db = client.db(dbName);

      const existingUser = await db
        .collection("users")
        .findOne({ email: user.email });

      if (existingUser) {
        const setupComplete = !!(
          existingUser.pin &&
          existingUser.phone &&
          existingUser.institution
        );

        // Return true or false based on whether setup is complete
        return setupComplete;
      } else {
        // Create a new user in MongoDB
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
            },
          },
          { upsert: true }
        );
        return false; // New user, needs to complete setup
      }
    },
    // Session callback to pass necessary data to the session
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.sub; // Add token user info to session
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};