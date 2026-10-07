# AWS Deployment & CI/CD Pipeline Guide using Docker & Jenkins

This document provides a step-by-step guide to deploying **MindCare AI** on Amazon Web Services (AWS) using a automated Jenkins CI/CD pipeline and Docker containerization.

---

## Architecture Overview

```
[ Git Repository ]
        │
        ▼ (Git Push / Webhook Trigger)
[ Jenkins CI/CD Server ]
        │
        ├── 1. Build Docker Image (Dockerfile)
        ├── 2. Authenticate & Push Image -> [ AWS ECR (Container Registry) ]
        └── 3. Deploy via SSH -> [ AWS EC2 Instance (Docker Runtime + SQLite Volume) ]
```

---

## 📁 Key Files Created

| File | Purpose |
| :--- | :--- |
| [`Dockerfile`](file:///d:/ABHIJIT%20WEB/Capstone/Dockerfile) | Multi-stage Docker build optimized for Next.js 14 + `better-sqlite3` native binaries. |
| [`.dockerignore`](file:///d:/ABHIJIT%20WEB/Capstone/.dockerignore) | Excludes node_modules, build caches, and sensitive files from Docker context. |
| [`docker-compose.yml`](file:///d:/ABHIJIT%20WEB/Capstone/docker-compose.yml) | Container runner definition with SQLite persistent storage. |
| [`Jenkinsfile`](file:///d:/ABHIJIT%20WEB/Capstone/Jenkinsfile) | Declarative CI/CD pipeline for checkout, build, push to AWS ECR, and deployment to AWS EC2. |
| [`next.config.mjs`](file:///d:/ABHIJIT%20WEB/Capstone/next.config.mjs) | Updated with `output: 'standalone'` for lightweight production image footprint (~180MB). |

---

## Step 1: AWS Cloud Setup

### 1.1 Create AWS ECR Repository
1. Log in to **AWS Management Console** -> Search **Elastic Container Registry (ECR)**.
2. Click **Create repository**.
3. Set Repository name: `mindcare-ai`.
4. Keep visibility as **Private** and click **Create repository**.

### 1.2 Launch AWS EC2 Instance
1. Go to **EC2 Console** -> **Launch Instance**.
2. Select **Ubuntu Server 22.04 LTS** or **Amazon Linux 2023** (t2.medium or t3.small recommended).
3. Select or generate an **SSH Key Pair** (e.g. `mindcare-ec2-key.pem`). Save this key file!
4. Under **Network Settings / Security Group**, configure inbound rules:
   - **SSH (Port 22)**: Source `My IP` or `Jenkins IP`
   - **HTTP (Port 80)**: Source `0.0.0.0/0`
   - **HTTPS (Port 443)**: Source `0.0.0.0/0`
   - **Custom TCP (Port 3000)**: Source `0.0.0.0/0` (Application Port)

---

## Step 2: Prepare EC2 Server Environment

SSH into your EC2 server and install Docker & AWS CLI:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

# 3. Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 4. Log out and back in to apply docker group permissions
exit
```

### Create Production `.env` File on EC2
Create an environment file at `/home/ubuntu/.env.production` on your EC2 instance:

```bash
nano /home/ubuntu/.env.production
```

Paste your production secrets:
```env
NODE_ENV=production
GROQ_API_KEY=your_production_groq_key
GEMINI_API_KEY_REPORTCHAT=your_gemini_key_1
GEMINI_API_KEY_SOCIAL=your_gemini_key_2
ADMIN_PASSCODE=your_secure_admin_passcode
```

---

## Step 3: Configure Jenkins Server

### 3.1 Install Required Jenkins Plugins
Go to **Jenkins** -> **Manage Jenkins** -> **Plugins** -> **Available Plugins** and install:
1. **Docker Pipeline**
2. **SSH Agent Plugin**
3. **Credentials Binding Plugin**

### 3.2 Add AWS & SSH Credentials in Jenkins
Go to **Manage Jenkins** -> **Credentials** -> **System** -> **Global credentials** -> **Add Credentials**:

1. **AWS ECR Credentials (`aws-ecr-credentials`)**:
   - **Kind**: Username with password
   - **Username**: *Your AWS Access Key ID*
   - **Password**: *Your AWS Secret Access Key*
   - **ID**: `aws-ecr-credentials`

2. **EC2 SSH Private Key (`aws-ec2-ssh-key`)**:
   - **Kind**: SSH Username with private key
   - **Username**: `ubuntu` (or `ec2-user`)
   - **Private Key**: Select *Enter directly* and paste content of your `.pem` key.
   - **ID**: `aws-ec2-ssh-key`

---

## Step 4: Configure & Run Jenkins Pipeline

1. In Jenkins dashboard, click **New Item**.
2. Name it `MindCare-AI-Pipeline` and select **Pipeline**. Click **OK**.
3. Scroll down to **Pipeline**:
   - **Definition**: *Pipeline script from SCM*
   - **SCM**: *Git*
   - **Repository URL**: `https://github.com/your-username/your-repo.git`
   - **Branch**: `*/main` or `*/master`
   - **Script Path**: `Jenkinsfile`
4. Ensure the environment section in [`Jenkinsfile`](file:///d:/ABHIJIT%20WEB/Capstone/Jenkinsfile) matches your ECR registry and EC2 IP:
   ```groovy
   AWS_ACCOUNT_ID = '647926790710'
   AWS_REGION     = 'ap-south-1'
   ECR_REPO_NAME  = 'mindcare-ai'
   EC2_HOST       = '13.201.128.206'
   ```
5. Commit and push [`Jenkinsfile`](file:///d:/ABHIJIT%20WEB/Capstone/Jenkinsfile) to Git.
6. Click **Build Now** in Jenkins.

---

## Step 5: Local Testing with Docker (Optional)

Before triggering Jenkins, test the Docker build locally:

```bash
# Build the Docker image
docker build -t mindcare-ai:local .

# Run container with volume mount for SQLite persistence
docker run -d \
  --name mindcare-test \
  -p 3000:3000 \
  --env-file .env.local \
  -v mindcare-data:/app/data \
  mindcare-ai:local

# Check running logs
docker logs -f mindcare-test
```

Visit `http://localhost:3000` to confirm everything runs cleanly.

---

## 🔒 SQLite Database Persistence Note

The app uses SQLite (`better-sqlite3`) located in `/app/data/mindcare.sqlite`.
In the [`Jenkinsfile`](file:///d:/ABHIJIT%20WEB/Capstone/Jenkinsfile) deployment stage, the `-v mindcare-sqlite-data:/app/data` flag ensures the database file is saved on an isolated, persistent Docker volume on EC2. **Deploying a new container update will NOT erase patient or doctor records.**
