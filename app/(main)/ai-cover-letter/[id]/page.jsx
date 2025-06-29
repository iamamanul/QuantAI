import Link from "next/link";
import { ArrowLeft, FileText, Building2, Briefcase, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCoverLetter } from "@/actions/cover-letter";
import CoverLetterPreview from "../_components/cover-letter-preview";
import { format } from "date-fns";

export default async function EditCoverLetterPage({ params }) {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);

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
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto md:mx-0">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1 space-y-3 w-full">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold gradient-title mb-2">
                {coverLetter?.jobTitle} at {coverLetter?.companyName}
              </h1>
              <p className="text-muted-foreground text-lg">
                AI-generated cover letter for your application
              </p>
            </div>
            
            {/* Cover Letter Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center w-full">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 w-full max-w-xs mx-auto md:mx-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Position</p>
                  <p className="text-sm text-blue-700">{coverLetter?.jobTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200 w-full max-w-xs mx-auto md:mx-0">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-purple-900">Company</p>
                  <p className="text-sm text-purple-700">{coverLetter?.companyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200 w-full max-w-xs mx-auto md:mx-0">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Created</p>
                  <p className="text-sm text-green-700">
                    {format(new Date(coverLetter?.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Letter Preview */}
      <div className="text-center">
        <CoverLetterPreview content={coverLetter?.content} />
      </div>
    </div>
  );
}
