// TechIcon.tsx
import React from "react";
import { Icon } from "@iconify/react";

interface TechIconProps {
  tech: string;
  className?: string;
}

const TechIcon: React.FC<TechIconProps> = ({ tech, className }) => {
  let icon;
  switch (tech) {
    case "Next.js":
      icon = <Icon icon="teenyicons:nextjs-outline" className={className} />;
      break;
    case "Tailwind CSS":
      icon = <Icon icon="teenyicons:tailwind-outline" className={className} />;
      break;
    case "Docker":
      icon = <Icon icon="teenyicons:docker-outline" className={className} />;
      break;
    case "Jenkins":
      icon = <Icon icon="simple-icons:jenkins" className={className} />;
      break;
    case "Python":
      icon = <Icon icon="teenyicons:python-outline" className={className} />;
      break;
    case "Selenium":
      icon = <Icon icon="simple-icons:selenium" className={className} />;
      break;
    case "Discord Webhooks":
      icon = <Icon icon="line-md:discord" className={className} />;
      break;
    case "Backtrader":
      icon = <Icon icon="mingcute:stock-line" className={className} />;
      break;
    case "Machine Learning Libraries":
      icon = <Icon icon="gravity-ui:abbr-ml" className={className} />;
      break;
    case "AWS":
      icon = <Icon icon="fontisto:aws" className={className} />;
      break;
    case "Github":
      icon = <Icon icon="line-md:github-loop" className={className} />;
      break;
    case "Link":
      icon = <Icon icon="line-md:link" className={className} />;
      break;
    case "ReactJS":
      icon = <Icon icon="akar-icons:react-fill" className={className} />;
      break;
    case "Material-UI":
      icon = <Icon icon="simple-icons:materialui" className={className} />;
      break;
    case "ExpressJS":
      icon = <Icon icon="simple-icons:express" className={className} />;
      break;
    case "Stripe":
      icon = <Icon icon="simple-icons:stripe" className={className} />;
      break;
    case "Firebase":
      icon = <Icon icon="simple-icons:firebase" className={className} />;
      break;
    case "Arduino":
      icon = <Icon icon="simple-icons:arduino" className={className} />;
      break;
    case "C++":
      icon = <Icon icon="logos:c-plusplus" className={className} />;
      break;
    case "MPU9250":
      icon = <Icon icon="ic:baseline-sensors" className={className} />;
      break;
    case "I2C Multiplexer":
      icon = <Icon icon="ic:baseline-developer-board" className={className} />;
      break;
    case "Spotify API":
      icon = <Icon icon="simple-icons:spotify" className={className} />;
      break;
    case "YT Music API":
      icon = <Icon icon="simple-icons:youtube" className={className} />;
      break;
    case "Keras":
      icon = <Icon icon="simple-icons:keras" className={className} />;
      break;
    case "TensorFlow":
      icon = <Icon icon="logos:tensorflow" className={className} />;
      break;
    case "Seaborn":
      icon = <Icon icon="simple-icons:seaborn" className={className} />;
      break;
    case "Jupyter Notebook":
      icon = <Icon icon="logos:jupyter" className={className} />;
      break;
    case "XGBoost":
      icon = <Icon icon="simple-icons:xgboost" className={className} />;
      break;
    case "NumPy":
      icon = <Icon icon="logos:numpy" className={className} />;
      break;
    case "pandas":
      icon = <Icon icon="simple-icons:pandas" className={className} />;
      break;
    case "scikit-learn":
      icon = <Icon icon="simple-icons:scikitlearn" className={className} />;
      break;
    case "OpenCV":
      icon = <Icon icon="simple-icons:opencv" className={className} />;
      break;
    case "NodeJS":
      icon = <Icon icon="logos:nodejs" className={className} />;
      break;
    case "MailChimp API":
      icon = <Icon icon="simple-icons:mailchimp" className={className} />;
      break;
    case "HTML":
      icon = <Icon icon="logos:html-5" className={className} />;
      break;
    case "CSS":
      icon = <Icon icon="logos:css-3" className={className} />;
      break;
    default:
      icon = <Icon icon="carbon:unknown-filled" className={className} />;
  }

  return <div className="flex items-center justify-center">{icon}</div>;
};

export default TechIcon;
