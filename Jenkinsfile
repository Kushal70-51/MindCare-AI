pipeline {
    agent any

    // Environment variables - Customize these for your AWS setup
    environment {
        AWS_ACCOUNT_ID = '647926790710'              // Your AWS Account ID
        AWS_REGION     = 'ap-south-1'                // Your AWS Region
        ECR_REPO_NAME  = 'mindcare-ai'               // AWS ECR Repository Name
        IMAGE_TAG      = "${BUILD_NUMBER}"
        ECR_REGISTRY   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        
        // Jenkins Credential IDs (configured in Jenkins -> Manage Jenkins -> Credentials)
        AWS_CRED_ID    = 'aws-ecr-credentials'       // AWS IAM credentials ID in Jenkins
        SSH_CRED_ID    = 'aws-ec2-ssh-key'           // SSH Key ID for EC2 deployment
        
        // Target AWS EC2 Instance details for deployment
        EC2_USER       = 'ec2-user'                  // Amazon Linux AMI default user
        EC2_HOST       = '13.201.128.206'            // Target AWS EC2 Public IP
        CONTAINER_NAME = 'mindcare-app'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "--> Checking out source code from Git repository..."
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "--> Building Docker Image: ${ECR_REGISTRY}/${ECR_REPO_NAME}:${IMAGE_TAG}"
                script {
                    sh "docker build -t ${ECR_REGISTRY}/${ECR_REPO_NAME}:${IMAGE_TAG} ."
                    sh "docker tag ${ECR_REGISTRY}/${ECR_REPO_NAME}:${IMAGE_TAG} ${ECR_REGISTRY}/${ECR_REPO_NAME}:latest"
                }
            }
        }

        stage('Push Image to AWS ECR') {
            steps {
                echo "--> Logging into AWS ECR & Pushing Docker Image..."
                withCredentials([usernamePassword(credentialsId: "${AWS_CRED_ID}", usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh """
                        aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID}
                        aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY}
                        aws configure set region ${AWS_REGION}
                        
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                        
                        docker push ${ECR_REGISTRY}/${ECR_REPO_NAME}:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/${ECR_REPO_NAME}:latest
                    """
                }
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                echo "--> Deploying updated container to AWS EC2 instance (${EC2_HOST})..."
                withCredentials([usernamePassword(credentialsId: "${AWS_CRED_ID}", usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sshagent(credentials: ["${SSH_CRED_ID}"]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                                set -e
                                aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID}
                                aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY}
                                aws configure set region ${AWS_REGION}
                                
                                aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                                
                                docker pull ${ECR_REGISTRY}/${ECR_REPO_NAME}:latest
                                
                                docker stop ${CONTAINER_NAME} || true
                                docker rm ${CONTAINER_NAME} || true
                                
                                # Run container with environment file and volume for SQLite database persistence
                                docker run -d \\
                                  --name ${CONTAINER_NAME} \\
                                  --restart always \\
                                  -p 3000:3000 \\
                                  --env-file /home/${EC2_USER}/.env.production \\
                                  -v mindcare-sqlite-data:/app/data \\
                                  ${ECR_REGISTRY}/${ECR_REPO_NAME}:latest
                                
                                # Clean up old unused images
                                docker image prune -f
                            '
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo "--> Cleaning up workspace Docker artifacts..."
            sh "docker rmi ${ECR_REGISTRY}/${ECR_REPO_NAME}:${IMAGE_TAG} || true"
        }
        success {
            echo "SUCCESS: CI/CD Pipeline completed and deployed to AWS successfully!"
        }
        failure {
            echo "FAILURE: Pipeline execution failed. Check Jenkins logs for details."
        }
    }
}
