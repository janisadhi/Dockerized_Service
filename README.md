
# Node.js Service Deployment with Docker and GitHub Actions

This project demonstrates deploying a Node.js service using Docker, an EC2 instance, and GitHub Actions for continuous integration and deployment.

---

## Features

1. **Node.js Service**:
   - A simple Node.js service built with environment variables (`.env` file).
   - Includes a `/secret` route secured with Basic Authentication.

2. **Dockerized Application**:
   - The application is containerized with a `Dockerfile` for portability.

3. **Remote Server Setup**:
   - An EC2 instance is provisioned for hosting the service.
   - The SSH public key is added to the server for secure access.

4. **CI/CD with GitHub Actions**:
   - Automated deployment workflow:
     - Builds the Docker image.
     - Pushes the image to DockerHub.
     - Pulls and deploys the image on the EC2 instance.

---

## Prerequisites

1. **Node.js Installed**:
   - [Node.js](https://nodejs.org/) must be installed locally to develop the service.

2. **AWS EC2 Instance**:
   - An EC2 instance with your SSH public key added to `~/.ssh/authorized_keys`.

3. **DockerHub Account**:
   - A valid DockerHub account to store and retrieve Docker images.

4. **GitHub Repository**:
   - Secrets for deployment must be configured in the repository.

---

## Steps

### 1. Create the Node.js Service

1. Build a simple Node.js service with two routes:
   - `/`: Returns "Hello, World!".
   - `/secret`: Returns a protected message using Basic Auth.
2. Add a `.env` file with:
   ```env
   SECRET_MESSAGE=YourSecretMessage
   USERNAME=YourUsername
   PASSWORD=YourPassword
   ```
3. Test the service locally before proceeding.

### 2. Write a Dockerfile

1. Create a `Dockerfile` for the Node.js service:
   ```dockerfile
   FROM node:14
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   CMD ["node", "index.js"]
   EXPOSE 3000
   ```
2. Build and test the Docker image locally:
   ```bash
   docker build -t nodejs-basic-service .
   docker run -p 3000:3000 nodejs-basic-service
   ```

### 3. Set Up the EC2 Instance

1. Launch an EC2 instance on AWS.
2. Add your public SSH key to `~/.ssh/authorized_keys` on the server:
   ```bash
   echo "your-public-key" >> ~/.ssh/authorized_keys
   ```

### 4. Configure GitHub Secrets

1. Add the following secrets in your GitHub repository:
   - `DOCKERHUB_USERNAME`: Your DockerHub username.
   - `DOCKERHUB_PASSWORD`: Your DockerHub password.
   - `REMOTE_HOST`: Public IP or hostname of the EC2 instance.
   - `REMOTE_USER`: Username for SSH (e.g., `ubuntu` for AWS).
   - `SSH_KEY`: Your private SSH key (used to access the EC2 instance).

### 5. Create the GitHub Actions Workflow

1. Add the following workflow file (`.github/workflows/deploy.yml`) to your repository:
   ```yaml
   name: Deploy to Remote Server

   on:
     push:
       branches:
         - main

   jobs:
     deploy:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout code
           uses: actions/checkout@v2

         - name: Set up SSH key
           run: |
             mkdir -p ~/.ssh
             echo "${{ secrets.SSH_KEY }}" > ~/.ssh/id_rsa
             chmod 600 ~/.ssh/id_rsa

         - name: Add remote server to known_hosts
           run: |
             ssh-keyscan -H ${{ secrets.REMOTE_HOST }} >> ~/.ssh/known_hosts

         - name: Log in to DockerHub
           uses: docker/login-action@v2
           with:
             username: ${{ secrets.DOCKERHUB_USERNAME }}
             password: ${{ secrets.DOCKERHUB_PASSWORD }}

         - name: Build and Push Docker Image
           run: |
             docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/nodejs-basic-service:latest .
             docker push ${{ secrets.DOCKERHUB_USERNAME }}/nodejs-basic-service:latest

         - name: Deploy to Remote Server
           run: |
             ssh -o StrictHostKeyChecking=no ${{ secrets.REMOTE_USER }}@${{ secrets.REMOTE_HOST }} << 'EOF'
             docker pull ${{ secrets.DOCKERHUB_USERNAME }}/nodejs-basic-service:latest
             docker stop nodejs-service || true
             docker rm nodejs-service || true
             docker run -d --name nodejs-service -p 3000:3000 ${{ secrets.DOCKERHUB_USERNAME }}/nodejs-basic-service:latest
             EOF
   ```

2. Commit and push the workflow to your repository:
   ```bash
   git add .
   git commit -m "Add GitHub Actions workflow for deployment"
   git push origin main
   ```

---

## Deployment Workflow

1. Push any code changes to the `main` branch of your repository.
2. GitHub Actions will:
   - Build and push the Docker image to DockerHub.
   - SSH into the EC2 instance.
   - Pull and deploy the updated Docker image.

3. Access the Node.js service at:
   ```
   http://<REMOTE_HOST>:3000
   ```

---

This project is part of [Janis Adhikari's](https://roadmap.sh/projects/server-stats)  DevOps projects.