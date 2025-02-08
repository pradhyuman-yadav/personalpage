pipeline {
    agent any

    environment {
        // Define *references* to your Jenkins credentials.
        NEXT_PUBLIC_SUPABASE_URL = credentials('NEXT_PUBLIC_SUPABASE_URL')
        NEXT_PUBLIC_SUPABASE_ANON_KEY = credentials('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        SUPABASE_SERVICE_ROLE_KEY = credentials('SUPABASE_SERVICE_ROLE_KEY')
    }

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/pradhyuman-yadav/personalpage.git', branch: 'main' // Replace with your repo/branch
            }
        }

        stage('Build Next.js Image') {
            steps {
                script {
                    def commitHash = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    sh """
                    docker build \\
                        --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}" \\
                        --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \\
                        --build-arg SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}" \\
                        -t my-nextjs-app:${commitHash} .
                    """
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    def commitHash = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    // Stop/remove any old container (with proper error handling)
                    try {
                        sh 'docker rm -f nextjs_container'
                    } catch (Exception e) {
                        echo "Container 'nextjs_container' did not exist or could not be removed. Continuing..."
                        // Optionally, log the full exception:  echo e.getMessage()
                    }

                    // Run the new container, using --env-file for runtime secrets
                    sh "docker run -v /proc:/host_proc -e HOST_PROC=/host_proc -d --name nextjs_container -p 3000:3000 --env-file /home/pradhyuman/jenkins-config/envFiles/.env.production my-nextjs-app:${commitHash}"
                }
            }
        }
    }
}