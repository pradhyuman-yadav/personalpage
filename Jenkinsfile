pipeline {
    agent {
        docker {
            image 'node:18'
            args '--privileged --network jenkins --env DOCKER_HOST=tcp://docker:2376 --env DOCKER_CERT_PATH=/certs/client --env DOCKER_TLS_VERIFY=1'
        }
    }
    tools {
        nodejs "NodeJS" // Specify the Node.js installation name
    }

    environment {
        IMAGE_NAME = "nextjs-app"
        CONTAINER_NAME = "nextjs-container"
        APP_PORT = "3000"
        DOCKER_TLS_CERTDIR = '/certs'
        HOME = '/var/jenkins_home'
        DOCKER_HOST = 'tcp://docker:2376'
        DOCKER_CERT_PATH = '/certs/client'
        DOCKER_TLS_VERIFY = '1'
    }

    stages {
        // stage('Clone Repository') {
        //     steps {
        //         git branch: 'main', url: 'https://github.com/pradhyuman-yadav/personalpage.git'
        //     }
        // }

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/pradhyuman-yadav/personalpage.git'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Start') {
            steps {
                sh 'npm start'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t my-nextjs-app:latest .
                docker run -d -p 3000:3000 my-nextjs-app:latest
                '''
            }
        }

        // stage('Build Docker Image') {
        //     steps {
        //         sh '''
        //         docker -H tcp://docker:2376 build -t $IMAGE_NAME .
        //         '''
        //     }
        // }

        // stage('Deploy Docker Container') {
        //     steps {
        //         sh '''
        //         docker -H tcp://docker:2376 stop $CONTAINER_NAME || true
        //         docker -H tcp://docker:2376 rm $CONTAINER_NAME || true
        //         docker -H tcp://docker:2376 run -d --name $CONTAINER_NAME -p $APP_PORT:$APP_PORT $IMAGE_NAME
        //         '''
        //     }
        // }
    }
}
