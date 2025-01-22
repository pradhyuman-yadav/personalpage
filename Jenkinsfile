pipeline {
    agent {
        // Spin up a node:18 container for building the Next.js app
        docker {
            image 'node:18'
            // Pass environment variables/flags to enable Docker-in-Docker
            args '--privileged --network jenkins ' +
                 '--env DOCKER_HOST=tcp://docker:2376 ' +
                 '--env DOCKER_CERT_PATH=/certs/client ' +
                 '--env DOCKER_TLS_VERIFY=1'
        }
    }

    // Set global environment variables if needed
    environment {
        // Ensure Docker works in the container
        DOCKER_HOST        = 'tcp://docker:2376'
        DOCKER_CERT_PATH   = '/certs/client'
        DOCKER_TLS_VERIFY  = '1'
        DOCKER_TLS_CERTDIR = '/certs'
    }

    stages {

        stage('Checkout') {
            steps {
                // Pull source code from GitHub
                git url: 'https://github.com/pradhyuman-yadav/personalpage.git',
                    branch: 'main'
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

        stage('Test Next.js') {
            steps {
                sh 'npm run test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build a Docker image for your Next.js app
                    sh '''
                    docker build -t my-nextjs-app:latest .
                    '''
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    // (Optional) Stop/remove any old running container
                    sh 'docker rm -f my-nextjs-container || true'

                    // Run the newly built image on port 3000
                    sh '''
                    docker run -d --name my-nextjs-container \
                      --network jenkins \
                      -p 3000:3000 \
                      my-nextjs-app:latest
                    '''

                    // If you want to see logs:
                    // sh 'docker logs -f my-nextjs-container'
                }
            }
        }
    }
}
