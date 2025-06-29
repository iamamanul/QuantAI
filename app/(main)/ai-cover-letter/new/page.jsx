import Link from "next/link";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CoverLetterGenerator from "../_components/cover-letter-generator";

export default function NewCoverLetterPage() {
  return (
    <div className="py-6 space-y-6">
      {/* Navigation */}
      <div className="flex flex-col space-y-2">
        <Link href="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>
      </div>

      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold gradient-title">
              Create Cover Letter
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Generate a tailored cover letter for your job application using AI
            </p>
          </div>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-blue-900">AI-Powered</p>
              <p className="text-sm text-blue-700">Tailored to your profile</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-purple-900">Professional</p>
              <p className="text-sm text-purple-700">Industry-standard format</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-green-900">ATS-Friendly</p>
              <p className="text-sm text-green-700">Optimized for tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generator Component */}
      <CoverLetterGenerator />
    </div>
  );
}
