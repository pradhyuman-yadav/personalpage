pipeline {
    agent any  // Runs on the Jenkins controller or an agent with Docker+Node installed


    environment {
        NEXT_PUBLIC_SUPABASE_URL = credentials('NEXT_PUBLIC_SUPABASE_URL')
        NEXT_PUBLIC_SUPABASE_ANON_KEY = credentials('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        SUPABASE_SERVICE_ROLE_KEY = credentials('SUPABASE_SERVICE_ROLE_KEY')
    }

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
                withCredentials([
                    string(credentialsId: 'NEXT_PUBLIC_SUPABASE_URL', variable: 'NEXT_PUBLIC_SUPABASE_URL'),
                    string(credentialsId: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', variable: 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
                    string(credentialsId: 'SUPABASE_SERVICE_ROLE_KEY', variable: 'SUPABASE_SERVICE_ROLE_KEY')
                ]) {
                    sh 'docker build -t my-nextjs-app:latest .'
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    // Stop/remove any old container to avoid conflicts
                    sh 'docker rm -f nextjs_container || true'

                    // Run the newly built image in the background
                    sh 'docker run -v /proc:/host_proc -e HOST_PROC=/host_proc -d --name nextjs_container -p 3000:3000 --env-file /home/pradhyuman/jenkins-config/envFiles/.env.production my-nextjs-app:latest'
                }
            }
        }
    }
}
