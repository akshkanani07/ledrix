"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Hammer,
  Wallet,
  TrendingDown,
  TrendingUp,
  IndianRupee,
  FileText,
  Calendar,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { formatMoney } from "@/lib/money";
import {
  transactionCreateSchema,
  type TransactionCreateInput,
} from "../schemas/transaction.schema";
import {
  createTransactionAction,
  updateTransactionAction,
} from "../actions/transaction.actions";
import { ROUTES } from "@/config/routes";

interface Worker {
  id: string;
  name: string;
  openingBalance: string;
}

interface TransactionFormProps {
  workers: Worker[];
  defaultWorkerId?: string;
  mode?: "create" | "edit";
  transactionId?: string;
  defaultValues?: Partial<TransactionCreateInput>;
}

const TYPE_CONFIG = {
  WORK: {
    label: "Work Entry",
    description: "Worker completed work",
    icon: Hammer,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  PAYMENT: {
    label: "Payment",
    description: "You paid the worker",
    icon: Wallet,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  ADVANCE: {
    label: "Advance",
    description: "Advance given to worker",
    icon: TrendingDown,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  DEDUCTION: {
    label: "Deduction",
    description: "Deduction from worker",
    icon: TrendingUp,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
} as const;

export function TransactionForm({
  workers,
  defaultWorkerId,
  mode = "create",
  transactionId,
  defaultValues,
}: TransactionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TransactionCreateInput>({
    resolver: zodResolver(transactionCreateSchema),
    defaultValues: {
      workerId: defaultValues?.workerId ?? defaultWorkerId ?? "",
      type: defaultValues?.type ?? "WORK",
      reason: defaultValues?.reason ?? "",
      workName: defaultValues?.workName ?? "",
      rate: defaultValues?.rate,
      pieces: defaultValues?.pieces,
      amount: (defaultValues?.amount ??
        undefined) as unknown as number,
      paymentMethod: defaultValues?.paymentMethod ?? "CASH",
      remarks: defaultValues?.remarks ?? "",
      date:
        defaultValues?.date ??
        new Date().toISOString().slice(0, 10),
    },
  });

  const type = form.watch("type");
  const rate = form.watch("rate");
  const pieces = form.watch("pieces");

  const typeInfo = TYPE_CONFIG[type];
  const TypeIcon = typeInfo.icon;

  // Auto-calculate amount for WORK (rate × pieces)
  useEffect(() => {
    if (type === "WORK" && rate && pieces && rate > 0 && pieces > 0) {
      form.setValue("amount", rate * pieces, { shouldValidate: true });
    }
  }, [rate, pieces, type, form]);

  async function onSubmit(values: TransactionCreateInput) {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("workerId", values.workerId);
    formData.append("type", values.type);
    formData.append("reason", values.reason);
    formData.append("workName", values.workName ?? "");
    formData.append("rate", values.rate != null ? String(values.rate) : "");
    formData.append("pieces", values.pieces != null ? String(values.pieces) : "");
    formData.append("amount", String(values.amount));
    formData.append("paymentMethod", values.paymentMethod ?? "");
    formData.append("remarks", values.remarks ?? "");
    formData.append("date", values.date);

    const result =
      mode === "create"
        ? await createTransactionAction(formData)
        : await updateTransactionAction(transactionId!, formData);

    setIsSubmitting(false);

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof TransactionCreateInput, {
            message: messages[0],
          });
        }
      }
      toast.error(result.message ?? "Failed to save transaction");
      return;
    }

    toast.success(result.message ?? "Saved");
    router.push(`/dashboard/workers/${values.workerId}`);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ─── Transaction Type Selector ──────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Transaction Type</CardTitle>
            <CardDescription>
              Choose what kind of entry you want to record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                      {(
                        Object.entries(TYPE_CONFIG) as Array<
                          [keyof typeof TYPE_CONFIG, (typeof TYPE_CONFIG)[keyof typeof TYPE_CONFIG]]
                        >
                      ).map(([key, config]) => {
                        const Icon = config.icon;
                        const isActive = field.value === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => field.onChange(key)}
                            className={cn(
                              "flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-all",
                              isActive
                                ? cn(config.border, config.bg)
                                : "border-border bg-card hover:border-zinc-300"
                            )}
                          >
                            <div
                              className={cn(
                                "rounded-lg p-1.5",
                                isActive ? "bg-white/80" : config.bg
                              )}
                            >
                              <Icon className={cn("size-4", config.color)} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                {config.label}
                              </p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {config.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ─── Worker + Reason ────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className={cn("rounded-lg p-1.5", typeInfo.bg)}>
                <TypeIcon className={cn("size-3.5", typeInfo.color)} />
              </div>
              {typeInfo.label} Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="workerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Worker <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting || workers.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a worker" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workers.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        type === "WORK"
                          ? "e.g., Kurti stitching for Week 1"
                          : type === "PAYMENT"
                          ? "e.g., Weekly payment"
                          : type === "ADVANCE"
                          ? "e.g., Advance for festival"
                          : "e.g., Late arrival deduction"
                      }
                      className="h-11"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ─── Work-specific fields ─────────────────── */}
            {type === "WORK" && (
              <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="workName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>
                        Work Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Kurti Stitching, Saree Fall"
                          className="h-11 bg-background"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="h-11 bg-background"
                          disabled={isSubmitting}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pieces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pieces</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-11 bg-background"
                          disabled={isSubmitting}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <p className="text-sm font-medium mb-2.5">Total</p>
                  <div className="flex h-11 items-center rounded-md border border-dashed bg-background px-3">
                    <span className="text-sm font-semibold">
                      {rate && pieces
                        ? formatMoney(rate * pieces)
                        : "₹0.00"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Payment method (PAYMENT/ADVANCE) ─────── */}
            {(type === "PAYMENT" || type === "ADVANCE") && (
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
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
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* ─── Amount + Date ──────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Amount & Date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Amount (₹) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <IndianRupee className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="h-11 pl-10 text-base font-semibold"
                          disabled={isSubmitting}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </div>
                    </FormControl>
                    {type === "WORK" && rate && pieces && (
                      <FormDescription>
                        Auto-calculated from Rate × Pieces
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="date"
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
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <FileText className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Textarea
                        placeholder="Optional notes about this entry..."
                        className="min-h-[70px] pl-10"
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

        {/* ─── Actions ──────────────────────────────────── */}
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
                Saving...
              </>
            ) : (
              <>{mode === "create" ? `Record ${typeInfo.label}` : "Save Changes"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}