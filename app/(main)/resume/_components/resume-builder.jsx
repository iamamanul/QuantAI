"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
  CheckCircle,
  Info,
  TrendingUp,
  Target,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { saveResume, getResume, improveWithAI } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { generateATSResume } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [atsScore, setAtsScore] = useState(0);
  const [atsFeedback, setAtsFeedback] = useState("");
  const [atsStrengths, setAtsStrengths] = useState([]);
  const [atsWeaknesses, setAtsWeaknesses] = useState([]);
  const [isImprovingSummary, setIsImprovingSummary] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  // Watch form fields for preview updates
  const formValues = watch();

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  // Load existing resume data
  useEffect(() => {
    const loadResumeData = async () => {
      try {
        const resume = await getResume();
        if (resume) {
          setAtsScore(resume.atsScore || 0);
          setAtsFeedback(resume.feedback || "");
          // Parse strengths and weaknesses if they exist
          if (resume.feedback) {
            // This would need to be stored in the database as JSON
            // For now, we'll use the feedback string
          }
        }
      } catch (error) {
        console.error("Error loading resume data:", error);
      }
    };
    loadResumeData();
  }, []);

  // Update preview content when form values change
  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = generateATSResume(user, formValues);
      setPreviewContent(newContent || initialContent);
    }
  }, [formValues, activeTab, user, initialContent]);

  // Handle save result
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
      // Update ATS score from the saved result
      if (saveResult.atsScore) {
        setAtsScore(saveResult.atsScore);
        setAtsFeedback(saveResult.feedback || "");
      }
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("resume-pdf");
      const opt = {
        margin: [10, 10],
        filename: `${user?.fullName || 'resume'}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formattedContent = previewContent
        .replace(/\n/g, "\n")
        .replace(/\n\s*\n/g, "\n\n")
        .trim();

      await saveResumeFn(formattedContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const getATSScoreColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-blue-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getATSScoreText = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">
          Resume Builder
        </h1>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              ATS Score: {atsScore}%
            </Badge>
            <div className={`w-2 h-2 rounded-full ${getATSScoreColor(atsScore)}`} />
            <span className="text-sm text-muted-foreground">
              {getATSScoreText(atsScore)}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="destructive"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="flex-1 sm:flex-none justify-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            <Button onClick={generatePDF} disabled={isGenerating} className="flex-1 sm:flex-none justify-center">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ATS Feedback Section */}
      {atsFeedback && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ATS Analysis & Feedback
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your resume's ATS compatibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall ATS Score</span>
                <span className="text-sm text-muted-foreground">{atsScore}/100</span>
              </div>
              <Progress value={atsScore} className="h-2" />
              <p className="text-sm text-muted-foreground">{atsFeedback}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                    error={errors.contactInfo?.email}
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Twitter/X Profile
                  </label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <div className="space-y-2">
                <Controller
                  name="summary"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="h-32"
                      placeholder="Write a compelling professional summary that highlights your key achievements and career objectives..."
                      error={errors.summary}
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isImprovingSummary}
                  onClick={async () => {
                    const summary = watch("summary");
                    if (!summary) {
                      toast.error("Please enter a summary first");
                      return;
                    }
                    setIsImprovingSummary(true);
                    try {
                      const improvedSummary = await improveWithAI({
                        current: summary,
                        type: "summary"
                      });
                      setValue("summary", improvedSummary);
                      toast.success("Summary improved successfully!");
                    } catch (error) {
                      toast.error("Failed to improve summary");
                    } finally {
                      setIsImprovingSummary(false);
                    }
                  }}
                >
                  {isImprovingSummary ? (
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
              {errors.summary && (
                <p className="text-sm text-red-500">{errors.summary.message}</p>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your key technical and soft skills (e.g., JavaScript, React, Project Management, Leadership)..."
                    error={errors.skills}
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          {activeTab === "preview" && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() =>
                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose edited markdown if you update the form data.
              </span>
            </div>
          )}
          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
          </div>
          <div className="hidden">
            <div id="resume-pdf" className="resume-pdf ats-friendly simple-layout no-images">
              <style jsx>{`
                .resume-pdf {
                  font-family: 'Arial', 'Helvetica', sans-serif;
                  font-size: 12px;
                  line-height: 1.4;
                  color: #000;
                  background: white;
                  padding: 20px;
                  max-width: 800px;
                  margin: 0 auto;
                }
                .resume-pdf h1 {
                  font-size: 28px;
                  font-weight: bold;
                  margin: 0 0 15px 0;
                  color: #2c3e50;
                  border-bottom: 3px solid #3498db;
                  padding-bottom: 8px;
                  text-align: center;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                }
                .resume-pdf h2 {
                  font-size: 16px;
                  font-weight: bold;
                  margin: 15px 0 8px 0;
                  color: #34495e;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .resume-pdf h3 {
                  font-size: 14px;
                  font-weight: bold;
                  margin: 10px 0 5px 0;
                  color: #2c3e50;
                }
                .resume-pdf p {
                  margin: 5px 0;
                  text-align: justify;
                }
                .resume-pdf strong {
                  font-weight: bold;
                  color: #2c3e50;
                }
                .resume-pdf ul {
                  margin: 5px 0;
                  padding-left: 20px;
                }
                .resume-pdf li {
                  margin: 3px 0;
                }
                .resume-pdf .contact-info {
                  text-align: center;
                  margin-bottom: 20px;
                  padding: 10px;
                  background-color: #f8f9fa;
                  border-radius: 5px;
                }
                .resume-pdf .section {
                  margin-bottom: 20px;
                }
                .resume-pdf .entry {
                  margin-bottom: 15px;
                  page-break-inside: avoid;
                }
                .resume-pdf .entry-header {
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                .resume-pdf .entry-date {
                  font-style: italic;
                  color: #7f8c8d;
                  margin-bottom: 8px;
                }
                .resume-pdf .entry-description {
                  margin-top: 5px;
                }
                .resume-pdf .skills-list {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 10px;
                  margin: 10px 0;
                }
                .resume-pdf .skill-item {
                  background-color: #ecf0f1;
                  padding: 3px 8px;
                  border-radius: 3px;
                  font-size: 11px;
                }
                @media print {
                  .resume-pdf {
                    padding: 15px;
                    font-size: 11px;
                  }
                  .resume-pdf h1 {
                    font-size: 20px;
                  }
                  .resume-pdf h2 {
                    font-size: 14px;
                  }
                  .resume-pdf h3 {
                    font-size: 12px;
                  }
                  .resume-pdf .entry {
                    page-break-inside: avoid;
                  }
                }
              `}</style>
              <MDEditor.Markdown
                source={previewContent}
                style={{
                  background: "white",
                  color: "black",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                  lineHeight: "1.4",
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
