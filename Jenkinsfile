pipeline {
    agent any

    environment {
        IMAGE_NAME = "nextjs-app"
        CONTAINER_NAME = "nextjs-container"
        APP_PORT = "3000"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/pradhyuman-yadav/personalpage.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker -H tcp://docker:2376 build -t $IMAGE_NAME .
                '''
            }
        }

        stage('Deploy Docker Container') {
            steps {
                sh '''
                docker -H tcp://docker:2376 stop $CONTAINER_NAME || true
                docker -H tcp://docker:2376 rm $CONTAINER_NAME || true
                docker -H tcp://docker:2376 run -d --name $CONTAINER_NAME -p $APP_PORT:$APP_PORT $IMAGE_NAME
                '''
            }
        }
    }
}
