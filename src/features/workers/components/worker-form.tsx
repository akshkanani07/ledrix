"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Phone, MapPin, IndianRupee, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { workerCreateSchema, type WorkerCreateInput } from "../schemas/worker.schema";
import { createWorkerAction, updateWorkerAction } from "../actions/worker.actions";
import { ROUTES } from "@/config/routes";

interface WorkerFormProps {
  mode: "create" | "edit";
  workerId?: string;
  defaultValues?: Partial<WorkerCreateInput>;
}

export function WorkerForm({ mode, workerId, defaultValues }: WorkerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkerCreateInput>({
    resolver: zodResolver(workerCreateSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      mobile: defaultValues?.mobile ?? "",
      address: defaultValues?.address ?? "",
      notes: defaultValues?.notes ?? "",
      openingBalance: defaultValues?.openingBalance ?? 0,
      status: defaultValues?.status ?? "ACTIVE",
      photo: defaultValues?.photo ?? "",
    },
  });

  async function onSubmit(values: WorkerCreateInput) {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("mobile", values.mobile ?? "");
    formData.append("address", values.address ?? "");
    formData.append("notes", values.notes ?? "");
    formData.append("openingBalance", String(values.openingBalance ?? 0));
    formData.append("status", values.status ?? "ACTIVE");

    const result =
      mode === "create"
        ? await createWorkerAction(formData)
        : await updateWorkerAction(workerId!, formData);

    setIsSubmitting(false);

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof WorkerCreateInput, {
            message: messages[0],
          });
        }
      }
      toast.error(result.message ?? "Something went wrong");
      return;
    }

    toast.success(result.message ?? "Success");

    if (mode === "create" && result.workerId) {
      router.push(`/dashboard/workers/${result.workerId}`);
    } else {
      router.push(`/dashboard/workers/${workerId}`);
    }
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ─── Basic Info ──────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
            <CardDescription>
              Worker&apos;s personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="e.g., Rajesh Patel"
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

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+91 98765 43210"
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

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <MapPin className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Textarea
                        placeholder="Village, city, state..."
                        className="min-h-[80px] pl-10"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ─── Ledger Settings ─────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ledger Settings</CardTitle>
            <CardDescription>
              Opening balance and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="openingBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Balance (₹)</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <IndianRupee className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-11 pl-10"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Positive = you owe worker. Negative = worker owes you.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <FileText className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Textarea
                        placeholder="Any additional notes..."
                        className="min-h-[80px] pl-10"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ─── Actions ─────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>{mode === "create" ? "Create Worker" : "Save Changes"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}