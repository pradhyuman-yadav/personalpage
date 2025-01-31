'use client'

import React from "react";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
    () => import('@/components/resumeView'),
    { 
      ssr: false,
      loading: () => <div className="text-center p-4">Loading PDF Viewer...</div>
    }
  );

const FullScreenImagePage = () => {
    return (
        <PDFViewer />
    );
};

export default FullScreenImagePage;
