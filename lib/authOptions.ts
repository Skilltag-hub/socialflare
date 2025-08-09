import GoogleProvider from "next-auth/providers/google";
import { MongoClient, ObjectId } from "mongodb";
import { SessionStrategy } from "next-auth";
import { randomInt } from "crypto";

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

// Function to generate a unique 6-digit referral code
const generateUniqueReferralCode = async (db: any): Promise<string> => {
  let code: string;
  let isUnique = false;

  while (!isUnique) {
    // Generate a 6-digit number and pad with leading zeros if needed
    code = randomInt(0, 1000000).toString().padStart(6, "0");

    // Check if code already exists in the database
    const existingUser = await db
      .collection("users")
      .findOne({ referralCode: code });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return code!;
};

// Helper function to check if email is a company email using a whitelist
// Note: Do NOT include public providers like gmail.com here; that prevents user creation.
const COMPANY_DOMAIN_WHITELIST = (
  process.env.COMPANY_EMAIL_DOMAINS || "enterprise.com,mlrit.ac.in"
)
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

const isCompanyEmail = (email: string) => {
  const domain = (email || "").split("@")[1]?.toLowerCase() || "";
  const isCompany = COMPANY_DOMAIN_WHITELIST.some(
    (d) => domain === d || domain.endsWith(`.${d}`)
  );
  console.log(
    `Checking company email ${email}: ${
      isCompany ? "company (whitelisted)" : "regular user / not whitelisted"
    }`
  );
  return isCompany;
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
          response_type: "code",
        },
      },
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
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: any;
      account: any;
      profile: any;
    }) {
      console.log("🔑 Sign in attempt:", {
        email: user?.email,
        provider: account?.provider,
        name: user?.name,
      });

      if (account?.provider === "google") {
        // Don't close the client connection - let it be managed by the connection pool
        const client = await connectToDatabase();
        try {
          const db = client.db(dbName);

          // Check if this is a company login
          const isCompany = isCompanyEmail(user.email);
          if (isCompany) {
            console.log("🏢 Company login detected (domain whitelisted)");
            return true;
          }

          // Regular user flow
          console.log("👤 Looking for existing user in database...");
          const existingUser = await db
            .collection("users")
            .findOne({ email: user.email });

          if (!existingUser) {
            console.log("🆕 No existing user found, creating new user...");
            const newUser = {
              email: user.email,
              name: user.name,
              image: user.image,
              referralCode: await generateUniqueReferralCode(db),
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
              setupComplete: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              emailVerified: new Date(),
            };

            console.log("📝 New user data:", JSON.stringify(newUser, null, 2));

            const result = await db.collection("users").insertOne(newUser);
            if (result.insertedId) {
              console.log("✅ New user created with ID:", result.insertedId);
              // Verify the user was actually created
              const createdUser = await db
                .collection("users")
                .findOne({ _id: result.insertedId });
              console.log(
                "🔍 Verifying user creation:",
                createdUser ? "Success" : "Failed"
              );
              return true;
            } else {
              console.error("❌ Failed to create user: No insertedId returned");
              return false;
            }
          }

          console.log("👤 Existing user found with ID:", existingUser._id);
          return true; // Always allow login
        } catch (error) {
          console.error("❌ Error in signIn callback:", error);
          return false;
        }
      }

      // For non-Google auth, just allow
      return true;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({
      token,
      user,
      account,
    }: {
      token: any;
      user: any;
      account: any;
    }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token;
        token.id = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
