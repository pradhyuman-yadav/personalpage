// components/PdfViewer.tsx
"use client";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "@radix-ui/react-icons";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PDFViewer() {
  const [, setNumPages] = useState<number | null>(null);
  const [pageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="">
        <div className="justify-self-end">
          <Button
            onClick={() => {
              const link = document.createElement("a");
              link.href = "/Resume.pdf";
              link.download = "Pradhyuman_resume.pdf";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <DownloadIcon />
          </Button>
        </div>
        <div className="pt-4 shadow-lg rounded-lg">
          <Document
            file="/Resume.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={console.error}
          >
            <Page
              pageNumber={pageNumber}
              width={800}
              renderTextLayer={false}
              className="max-w-full"
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
