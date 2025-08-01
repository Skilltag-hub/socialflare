import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      isCompany?: boolean;
      onboardingComplete?: boolean;
    } & DefaultSession["user"]
  }

  interface User {
    isCompany?: boolean;
    onboardingComplete?: boolean;
  }
}
