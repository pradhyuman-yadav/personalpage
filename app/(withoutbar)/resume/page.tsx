'use client'

import React from "react";
import {PDFEmbed} from "@/components/resume";
import { Suspense } from 'react';
import dynamic from "next/dynamic";
// import PDFViewer from "@/components/resumeView";

const PDFViewer = dynamic(
    () => import('@/components/resumeView'),
    { 
      ssr: false,
      loading: () => <div className="text-center p-4">Loading PDF Viewer...</div>
    }
  );

const FullScreenImagePage = () => {
    return (
        // <PDFEmbed />
        <PDFViewer />
    );
};

export default FullScreenImagePage;
