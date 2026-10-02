"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { updateProfileAction } from "../actions/settings.actions";
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from "../schemas/settings.schema";

interface ProfileFormProps {
  defaultName: string;
  email: string;
}

export function ProfileForm({ defaultName, email }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { name: defaultName },
  });

  async function onSubmit(values: ProfileUpdateInput) {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", values.name);

    const result = await updateProfileAction(formData);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message ?? "Failed to update profile");
      return;
    }

    toast.success("Profile updated");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <div className="relative group">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-11 pl-10"
                    disabled={isSubmitting}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">Email</p>
          <Input
            className="h-11 bg-muted"
            value={email}
            disabled
            readOnly
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed
          </p>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </form>
    </Form>
  );
}