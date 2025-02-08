// t/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import React, { useState } from "react";

// Define the validation schema for the URL submission.
const FormSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  expirationHours: z.coerce
    .number({ invalid_type_error: "Expiration must be a number" }) // Added validation
    .int({ message: "Expiration must be a whole number" })
    .positive({ message: "Expiration must be a positive number" })
    .max(72, { message: "Expiration cannot exceed 72 hours" }), // Added Max
});

export default function UrlSubmissionForm() {
  const [shortUrl, setShortUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: "",
      expirationHours: 1, // Default to 1 hour
    },
  });

  const { toast } = useToast()

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await axios.post("/api/shorten", {
        url: data.url,
        expirationHours: data.expirationHours, // Send expirationHours to the API
      });

      const result = response.data;
      const shortUrl = `${window.location.origin}/t/${result.slug}`;
      setShortUrl(shortUrl);

      toast({
        title: "Short URL Created!",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{shortUrl}</code>
          </pre>
        ),
      });
    } catch (error: unknown) {
      console.error("URL submission error:", error);
      // toast({
      //   title: "Unexpected error",
      //   description:
      //     error.response?.data?.message ||
      //     "An error occurred while shortening the URL.",
      //   variant: "destructive",
      // });
      if (axios.isAxiosError(error)) {
        toast({
          title: "Unexpected error",
          description:
            error.response?.data?.message ||
            "An error occurred while shortening the URL.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unexpected error",
          description: "An unknown error occurred.",
          variant: "destructive",
        });
      }
      setShortUrl(null);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-4/5">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a valid URL that you wish to shorten.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-full sm:w-1/5">
            <FormField
              control={form.control}
              name="expirationHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration (Hours)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the number of hours until the URL expires (max 72).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Shorten URL"}
        </Button>
        {shortUrl && (
          <div className="mt-4">
            <p>Your short URL:</p>
            <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
              <code className="text-white">{shortUrl}</code>
            </pre>
          </div>
        )}
      </form>
    </Form>
  );
}
