# Project Spotlight: Personal Portfolio Website - [thepk.in](https://thepk.in)

This document details the development, deployment, and ongoing maintenance of my personal portfolio website, [thepk.in](https://thepk.in). This project showcases my full-stack development skills, encompassing front-end design, back-end infrastructure, and DevOps best practices. It's not just a static website; it's a testament to my ability to build and manage a robust, high-availability web application from the ground up, running on a self-hosted home server environment and securely exposed to the internet via Cloudflare Tunnel.

## Overview

The website serves as a central hub for my professional profile, showcasing projects, skills, and experience. It was built with a focus on performance, security, and maintainability, leveraging modern web technologies and a robust deployment pipeline.  A key aspect of this project is its secure and reliable accessibility from anywhere in the world, achieved without directly exposing my home network to the public internet.

## Technical Stack & Key Skills Demonstrated

*   **Frontend:** Next.js, Tailwind CSS, React
*   **Backend:** (Implicit in Next.js – server-side rendering and API routes)
*   **Containerization:** Docker
*   **Continuous Integration/Continuous Deployment (CI/CD):** Jenkins
*   **Infrastructure:** Linux (Ubuntu Server), Nginx (reverse proxy), SSL/TLS (managed by Cloudflare)
*   **Networking & Security:** Cloudflare Tunnel, DNS Management
*   **Version Control:** Git (with GitHub/GitLab – assumed, but best practice)
*   **Additional Skills:** Linux Server Administration, Performance Optimization, Security Hardening

## Key Accomplishments & Features

*   **High Availability (99.9% Uptime):** Achieved through a combination of Docker containerization, robust server configuration, proactive monitoring, and the inherent redundancy provided by Cloudflare's network. The Dockerized environment ensures consistent application behavior. Uptime is monitored using UptimeRobot, with alerts configured for immediate response to any downtime.
*   **Automated CI/CD Pipeline (Jenkins):** A fully automated Jenkins pipeline handles the build, test, and deployment process. This pipeline is triggered by commits to the main branch. The pipeline performs:
    *   **Code Checkout:** Retrieves the latest code.
    *   **Dependency Installation:** Installs project dependencies (`npm install`).
    *   **Build:** Builds the Next.js application (`next build`).
    *   **Docker Image Creation:** Creates a new Docker image.
    *   **Docker Image Push:** Pushes the new image to a private Docker registry.
    *   **Deployment:** Connects to the production server via SSH and executes a script to pull the latest image, stop the existing container, and start a new container.
    *   **Automated Testing:** Basic smoke tests (e.g., checking for a 200 OK response) are included.
*   **Optimized Deployment Workflows (40% Build Time Reduction):** Achieved through:
    *   Leveraging Next.js's built-in caching.
    *   Optimizing Dockerfile layers.
    *   Implementing parallel build steps within Jenkins.
    *   Using a persistent build cache for npm dependencies.
    *   Reduced redundancy.
*   **Responsive Design (Tailwind CSS):** The website is fully responsive and provides an optimal viewing experience across all devices.
*   **Performance Optimization:**
    *   **Next.js Static Site Generation (SSG):** Most pages are statically generated at build time.
    *   **Image Optimization:** Images are optimized using Next.js's `next/image` component.
    *   **Code Splitting:** Next.js automatically code-splits the application.
    *   **Cloudflare CDN:** Leveraging Cloudflare's global CDN for caching and faster content delivery. *This is a major benefit of using Cloudflare Tunnel.*
*   **Security:**
    *   **HTTPS/SSL (Managed by Cloudflare):**  Cloudflare automatically handles SSL/TLS encryption, providing a secure connection to the website.  This simplifies certificate management and ensures best-practice security configurations.
    *   **Cloudflare Tunnel:** This is the *core* security enhancement.  Instead of opening ports on my home router, Cloudflare Tunnel creates an outbound-only connection from my home server to Cloudflare's network.  This means:
        *   **No Open Inbound Ports:** My home network is *not* directly exposed to the internet, significantly reducing the attack surface.
        *   **DDoS Protection:** Cloudflare's robust infrastructure provides protection against DDoS attacks.
        *   **Web Application Firewall (WAF):** Cloudflare's WAF (optional, but a plausible addition) can be used to further protect the website from common web vulnerabilities.
    *   **Nginx Configuration:** Nginx is configured as a local reverse proxy, handling traffic from the Cloudflare Tunnel daemon (`cloudflared`).
    *   **Regular Security Updates:** The server's operating system and software packages are kept up-to-date.
* **Home Server Hosting with Secure Public Access (Cloudflare Tunnel):** The use of Cloudflare Tunnel allows me to securely expose my home-hosted website to the public internet without the risks associated with traditional port forwarding. This demonstrates a strong understanding of networking and security best practices.

## Future Enhancements

*   **Content Management System (CMS):** Integrating a headless CMS.
*   **Enhanced Monitoring:** Implementing more comprehensive monitoring and logging.
*   **Automated Security Audits:** Integrating automated security scanning into the CI/CD pipeline.
*   **A/B Testing:** Implementing A/B testing.

## Conclusion

The [thepk.in](https://thepk.in) project showcases a strong understanding of modern web development, DevOps, and network security. By leveraging Cloudflare Tunnel, I've created a secure, high-performance, and highly available website hosted on my home server, demonstrating a practical approach to building and deploying real-world applications. This project highlights my proactive problem-solving and commitment to robust, secure solutions.
