"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Sparkles, Download, Eye, User, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { generateCoverLetter, improveJobDescription } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch";
import { coverLetterSchema } from "@/app/lib/schema";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CoverLetterGenerator() {
  const router = useRouter();
  const [isImprovingDescription, setIsImprovingDescription] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
  });

  const {
    loading: generating,
    fn: generateLetterFn,
    data: generatedLetter,
  } = useFetch(generateCoverLetter);

  // Update content when letter is generated
  useEffect(() => {
    if (generatedLetter) {
      toast.success("Cover letter generated successfully!");
      router.push(`/ai-cover-letter/${generatedLetter.id}`);
      reset();
    }
  }, [generatedLetter]);

  const onSubmit = async (data) => {
    try {
      await generateLetterFn(data);
    } catch (error) {
      toast.error(error.message || "Failed to generate cover letter");
    }
  };

  const handleImproveJobDescription = async () => {
    const jobDescription = watch("jobDescription");
    if (!jobDescription) {
      toast.error("Please enter a job description first");
      return;
    }

    setIsImprovingDescription(true);
    try {
      const improvedDescription = await improveJobDescription(jobDescription);
      setValue("jobDescription", improvedDescription);
      toast.success("Job description improved successfully!");
    } catch (error) {
      toast.error("Failed to improve job description");
    } finally {
      setIsImprovingDescription(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Tips */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Cover Letter Tips
          </CardTitle>
          <CardDescription>
            For best results, provide detailed job descriptions and company information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">✓</Badge>
              <span className="text-sm">Include specific requirements</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">✓</Badge>
              <span className="text-sm">Mention company values</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">✓</Badge>
              <span className="text-sm">Highlight key responsibilities</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Your contact details that will appear in the cover letter header
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="fullName"
                placeholder="e.g., John Doe"
                className="h-12"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., john.doe@email.com"
                className="h-12"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                placeholder="e.g., +1 (555) 123-4567"
                className="h-12"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address *
              </Label>
              <Input
                id="address"
                placeholder="e.g., 123 Main St, City, State 12345"
                className="h-12"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-sm text-red-500">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Job Details</CardTitle>
          <CardDescription>
            Provide comprehensive information about the position you're applying for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Company and Job Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google, Microsoft, Apple"
                  className="h-12"
                  {...register("companyName")}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-sm font-medium">
                  Job Title *
                </Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Software Engineer"
                  className="h-12"
                  {...register("jobTitle")}
                />
                {errors.jobTitle && (
                  <p className="text-sm text-red-500">
                    {errors.jobTitle.message}
                  </p>
                )}
              </div>
            </div>

            {/* Job Description with AI Improvement */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="jobDescription" className="text-sm font-medium">
                  Job Description *
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isImprovingDescription}
                  onClick={handleImproveJobDescription}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {isImprovingDescription ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Improving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Improve with AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="jobDescription"
                placeholder="Paste the complete job description here. Include requirements, responsibilities, and company information for better results..."
                className="h-48 resize-none"
                {...register("jobDescription")}
              />
              {errors.jobDescription && (
                <p className="text-sm text-red-500">
                  {errors.jobDescription.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                💡 Tip: The more detailed the job description, the better your cover letter will be tailored to the position.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                className="sm:w-auto"
              >
                Clear Form
              </Button>
              <Button 
                type="submit" 
                disabled={generating}
                className="sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Cover Letter...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
