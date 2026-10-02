import type { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

declare module "better-auth" {
  interface Session {
    user: Session["user"];
    session: Session["session"];
  }
}

export {};