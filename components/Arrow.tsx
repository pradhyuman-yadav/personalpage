// components/ArrowComponent.tsx
"use client";
import { useEffect, useState } from "react";

interface ArrowComponentProps {
  className?: string;
}

const ArrowComponent: React.FC<ArrowComponentProps> = ({ className = "" }) => {
  const [svgD, setSvgD] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState<string>("0 0 894 472"); // Default, update from SVG

  useEffect(() => {
    fetch("/arrow2.svg") // Fetch from the public folder
      .then((res) => res.text())
      .then((data) => {
        // 1. Parse the SVG to get the viewBox
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(data, "image/svg+xml");
        const svgElement = svgDoc.querySelector("svg");

        if (svgElement) {
          const newViewBox = svgElement.getAttribute("viewBox");
          if (newViewBox) {
            setViewBox(newViewBox);
          }

          // 2. Extract the 'd' attributes of all <path> elements
          const paths = svgElement.querySelectorAll("path");
          let allD = "";
          paths.forEach((path) => {
            const dAttribute = path.getAttribute("d");
            if (dAttribute) {
              allD += dAttribute;
            }
          });

          setSvgD(allD);
        } else {
          console.error("Invalid SVG file: <svg> element not found.");
          setSvgD(""); // Set to empty to avoid errors
        }
      })
      .catch((error) => {
        console.error("Error fetching or parsing SVG:", error);
        setSvgD(""); // Set to empty string on error to prevent rendering issues.
      });
  }, []);

  if (!svgD) {
    return <div>Loading SVG...</div>; // Or a placeholder
  }

  return (
    <div className={`hidden md:block ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={100} // Use props or CSS for sizing
        height={150}
        viewBox={viewBox}
        className=" fill-blue-500 dark:fill-blue-300 -rotate-[60deg] absolute top-6 right-2 translate-x-6 -z-10"
      >
        {svgD
          .split("M")
          .slice(1)
          .map((pathData, index) => (
            <path key={index} d={`M${pathData}`} />
          ))}
      </svg>
      <p className="text-center mt-2 font-shadows2 absolute top-[250px] right-0 -rotate-[90deg] translate-x-16">Try hovering your mouse over here!</p>
    </div>
  );
};

export default ArrowComponent;
