import type { Metadata } from "next";

import { requireSession } from "@/lib/session";
import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { WorkspaceForm } from "@/features/settings/components/workspace-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your workspace and account",
};

export default async function SettingsPage() {
  const session = await requireSession();
  const workspace = await requireWorkspace();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your workspace and account preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>
              Your personal account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              defaultName={session.user.name ?? ""}
              email={session.user.email}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workspace</CardTitle>
            <CardDescription>
              Your team&apos;s workspace settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkspaceForm
              defaultValues={{
                name: workspace.name,
                description: workspace.description ?? "",
                currency: workspace.currency,
                timezone: workspace.timezone,
              }}
            />
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions for your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Delete Workspace</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete all data. This cannot be undone.
                </p>
              </div>
              <button
                disabled
                className="cursor-not-allowed rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive opacity-50"
              >
                Coming soon
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}