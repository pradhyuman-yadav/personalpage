pipeline {
    agent any  // Runs on the Jenkins controller or an agent with Docker+Node installed

    stages {

        stage('Checkout') {
            steps {
                git url: 'https://github.com/pradhyuman-yadav/personalpage.git', branch: 'main'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Next.js') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                // Build the Docker image using the Dockerfile in the repo
                sh 'docker build -t my-nextjs-app:latest .'
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    // Stop/remove any old container to avoid conflicts
                    sh 'docker rm -f nextjs_container || true'

                    // Run the newly built image in the background
                    sh 'docker run -d --name nextjs_container -p 3000:3000 my-nextjs-app:latest'
                }
            }
        }
    }
}
