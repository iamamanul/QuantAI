"use client";

import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Download, Edit, Eye, FileText } from "lucide-react";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";
import { toast } from "sonner";

const CoverLetterPreview = ({ content }) => {
  const [previewMode, setPreviewMode] = useState("preview");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById("cover-letter-pdf");
      const opt = {
        margin: [15, 15],
        filename: "cover-letter.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Cover Letter Preview</h2>
          <p className="text-muted-foreground">
            Review and download your generated cover letter
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(previewMode === "preview" ? "edit" : "preview")}
            className="flex-1 sm:flex-none justify-center"
          >
            {previewMode === "preview" ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="flex-1 sm:flex-none justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isGeneratingPDF ? (
              <>
                <FileText className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Cover Letter Content */}
      <div className="border rounded-lg overflow-hidden">
        <MDEditor
          value={content}
          preview={previewMode}
          height={700}
          className="cover-letter-editor"
        />
      </div>

      {/* Hidden PDF Element */}
      <div className="hidden">
        <div id="cover-letter-pdf" className="p-8 bg-white">
          <style jsx>{`
            .cover-letter-pdf {
              font-family: 'Times New Roman', serif;
              font-size: 12px;
              line-height: 1.6;
              color: #000;
              background: white;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .cover-letter-pdf h1 {
              font-size: 18px;
              font-weight: bold;
              margin: 0 0 20px 0;
              color: #2c3e50;
              text-align: center;
            }
            .cover-letter-pdf h2 {
              font-size: 14px;
              font-weight: bold;
              margin: 15px 0 10px 0;
              color: #34495e;
            }
            .cover-letter-pdf p {
              margin: 10px 0;
              text-align: justify;
            }
            .cover-letter-pdf .header {
              margin-bottom: 30px;
            }
            .cover-letter-pdf .date {
              margin-bottom: 20px;
            }
            .cover-letter-pdf .greeting {
              margin-bottom: 15px;
            }
            .cover-letter-pdf .body {
              margin-bottom: 20px;
            }
            .cover-letter-pdf .closing {
              margin-top: 30px;
            }
            .cover-letter-pdf .signature {
              margin-top: 40px;
            }
            @media print {
              .cover-letter-pdf {
                padding: 15px;
                font-size: 11px;
              }
            }
          `}</style>
          <MDEditor.Markdown
            source={content}
            style={{
              background: "white",
              color: "black",
              fontFamily: "Times New Roman, serif",
              fontSize: "12px",
              lineHeight: "1.6",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPreview;
