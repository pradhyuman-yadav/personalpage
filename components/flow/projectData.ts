// projectsData.ts

import { AnnotationNodeData } from "@/components/flow/AnnotationNodeData";

export interface Project {
  id: string;
  title: string;
  techStack: string[];
  description: string;
  githubLink?: string;
  liveLink?: string;
  startDate?: string;
  endDate?: string;
  position?: { x: number; y: number };
}

export const projectsData: Project[] = [
  {
    id: "project-A",
    title: "Personal Website",
    techStack: ["Next.js", "Tailwind CSS", "Docker", "Jenkins"],
    description:
      "My portfolio showcasing projects, skills, and experience. Built with Next.js for performance and SEO.",
    githubLink: "https://thepk.in",
    liveLink: "https://thepk.in",
    startDate: "Jan 2025",
    endDate: "Present",
  },
  {
    id: "project-D",
    title: "Video Streaming Platform",
    techStack: ["Next.js", "AWS", "Docker"],
    description:
      "A full-stack platform for video uploading, processing, and streaming, with user management.",
    githubLink: "github.com/pradhyuman-yadav/shadowveil",
    liveLink: "",
    startDate: "Oct 2024",
  },
  {
    id: "project-B",
    title: "JobMatch Automator",
    techStack: ["Python", "Selenium", "Discord Webhooks"],
    description:
      "Automated job application data collection from multiple job boards, streamlining the job search.",
    githubLink: "",
    liveLink: "",
    startDate: "Jun 2024",
    endDate: "Jul 2024",
  },
  {
    id: "project-C",
    title: "Trading with ML",
    techStack: ["Python", "Backtrader", "Machine Learning Libraries"],
    description:
      "An ML-powered trading platform using real-time data and optimized pipelines for trading strategies.",
    githubLink: "github.com/pradhyuman-yadav/trading-script",
    liveLink: "",
    startDate: "Dec 2024",
    endDate: "Jan 2025",
  },
  {
    id: "project-E",
    title: "AI Roommate Assistant",
    techStack: ["Python", "Some AI Library"],
    description: "An AI assistant to help with roommate tasks.",
    githubLink: "",
    liveLink: "",
    startDate: "Sep 2023",
  },
  {
    id: "project-G",
    title: "AI Instagram Model",
    techStack: ["Python", "Some Generative AI Library"],
    description: "A project to generate images using AI.",
    githubLink: "",
    liveLink: "",
    startDate: "Jan 2023",
    endDate: "Feb 2023",
  },
  {
    id: "project-J",
    title: "Custom Music Player",
    techStack: ["ReactJS", "ExpressJS", "Spotify API", "YT Music API"],
    description:
      "A personal project to create a custom music player with a unique visual design. Built with ReactJS and ExpressJS, the application integrates Spotify and YT Music APIs to fetch songs and lyrics.",
    githubLink: "",
    liveLink: "",
    startDate: "May 2021",
    endDate: "Jun 2021",
  },
  {
    id: "project-H",
    title: "E-Commerce Platform for MIT",
    techStack: ["ReactJS", "Material-UI", "ExpressJS", "Stripe", "Firebase"],
    description:
      "Designed and developed a full-stack e-commerce website for Manipal Institute of Technology. The platform supports order placement, user management, and secure payment processing with Stripe. Firebase hosting and functions ensure cost-effective maintenance.",
    githubLink: "",
    liveLink: "",
    startDate: "Apr 2021",
    endDate: "May 2021",
  },
  {
    id: "project-I",
    title: "Full Body Motion Capture Suit",
    techStack: ["Arduino", "C++", "MPU9250", "I2C Multiplexer"],
    description:
      "Developed a full-body motion capture suit using Arduino Mega and MPU9250 sensors. Integrated sensor data for real-time motion tracking, with ongoing enhancements for finger tracking and facial expression detection.",
    githubLink: "",
    liveLink: "",
    startDate: "Mar 2021",
    endDate: "Mar 2022",
  },
  {
    id: "project-L",
    title: "Parkinson's Disease Detector",
    techStack: ["Python", "Jupyter Notebook", "XGBoost", "NumPy", "pandas", "scikit-learn"],
    description:
      "A deep learning project to detect Parkinson's disease using a dataset from UCI. Implemented in Jupyter Notebook with an XGBoost classifier, and utilized popular Python libraries for data processing and model evaluation.",
    githubLink: "",
    liveLink: "",
    startDate: "Apr 2020",
    endDate: "May 2020",
  },
  {
    id: "project-F",
    title: "Wild Animal Detection",
    techStack: ["Python", "Computer Vision Library"],
    description: "A project to detect wild animals using computer vision.",
    githubLink: "",
    liveLink: "",
    startDate: "Oct 2020",
  },
  {
    id: "project-K",
    title: "Fake Profile Detector",
    techStack: ["Python", "Keras", "TensorFlow", "Seaborn"],
    description:
      "An analytical tool to detect fake Instagram profiles using deep learning techniques. Leveraged Keras with TensorFlow for model building and Seaborn for data visualization to understand neural network behaviors.",
    githubLink: "",
    liveLink: "",
    startDate: "Mar 2020",
    endDate: "Jul 2020",
  },
  {
    id: "project-M",
    title: "Color Detection Application",
    techStack: ["Python", "OpenCV", "NumPy", "pandas"],
    description:
      "An exploratory project in image processing that uses OpenCV to detect and analyze colors in images. This project helped solidify my understanding of Python libraries and image manipulation techniques.",
    githubLink: "",
    liveLink: "",
    startDate: "Mar 2020",
    endDate: "Apr 2020",
  },
  {
    id: "project-N",
    title: "Newsletter Signup Website",
    techStack: ["HTML", "CSS", "NodeJS", "ExpressJS", "MailChimp API"],
    description:
      "A straightforward newsletter signup website built with HTML, CSS, and NodeJS using the Express framework. Integrated MailChimp's API for handling subscriptions and hosted on Heroku for cost efficiency and minimal maintenance.",
    githubLink: "",
    liveLink: "",
    startDate: "Oct 2019",
    endDate: "Nov 2019",
  },
];

export const annotationData: AnnotationNodeData[] = [
  {
      label:
        "Built-in node and edge types. Draggable, deletable and connectable!",
      arrowStyle: {
        right: 0,
        bottom: 0,
        transform: 'translate(-30px,10px) rotate(-80deg)',
      },
      position: { x: -200, y: -30 },
    
  },
];