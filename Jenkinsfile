pipeline {
    agent any

    tools {
        nodejs 'NodeJS LTS'
    }

    environment {
        EC2_SERVER = '34.197.126.56'
        DEPLOY_USER = 'ubuntu'
        APP_DIR = '/home/ubuntu/api-gateway-ecomerce'
        APP_REPO_URL = 'https://github.com/donetrmteam/api-gateway-ecomerce.git'
        PORT_DEV = '3000'
        PORT_QA  = '3001'
        PORT_MAIN = '3002'
    }

    stages {
        stage('Clone App Repo') {
            steps {
                script {
                    sh 'rm -rf app'
                    sh "git clone -b ${env.BRANCH_NAME} ${env.APP_REPO_URL} app"
                }
            }
        }

        stage('List Files') {
            steps {
                dir('app') {
                    sh 'ls -la'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('app') {
                    sh 'npm ci'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    def deployPort = ''
                    def serviceName = ''
                    def targetBranch = env.BRANCH_NAME

                    if (targetBranch == 'dev') {
                        deployPort = env.PORT_DEV
                        serviceName = 'user-service-dev'
                    } else if (targetBranch == 'qa') {
                        deployPort = env.PORT_QA
                        serviceName = 'user-service-qa'
                    } else if (targetBranch == 'main') {
                        deployPort = env.PORT_MAIN
                        serviceName = 'user-service-prod'
                    } else {
                        echo "No se desplegará la rama: ${targetBranch}"
                        return
                    }

                    withCredentials([sshUserPrivateKey(credentialsId: 'ssh-key-lucas', keyFileVariable: 'SSH_KEY')]) {
                        sh """
                            ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${DEPLOY_USER}@${EC2_SERVER} '
                                sudo apt update && sudo apt upgrade -y

                                export NVM_DIR="\$HOME/.nvm"
                                if [ ! -d "\$NVM_DIR" ]; then
                                    echo "Instalando NVM..."
                                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
                                fi
                                [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"

                                nvm install --lts
                                nvm use --lts

                                node --version
                                npm --version

                                npm install -g pm2
                                pm2 --version

                                if ! command -v git &> /dev/null; then
                                    sudo apt install -y git
                                fi

                                if ! command -v nginx &> /dev/null; then
                                    echo "Instalando Nginx..."
                                    sudo apt install -y nginx
                                fi
                                sudo systemctl start nginx
                                sudo systemctl enable nginx

                                APP_BRANCH_DIR="${APP_DIR}-${targetBranch}"

                                if [ ! -d "\${APP_BRANCH_DIR}" ]; then
                                    echo "Clonando repositorio..."
                                    git clone -b ${targetBranch} ${env.APP_REPO_URL} \${APP_BRANCH_DIR}
                                else
                                    echo "Actualizando repositorio..."
                                    cd \${APP_BRANCH_DIR}
                                    git fetch --all
                                    git checkout ${targetBranch}
                                    git pull origin ${targetBranch}
                                fi

                                [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
                                nvm use --lts

                                cd \${APP_BRANCH_DIR}
                                npm ci

                                if grep -q "\\\"build\\\"" package.json; then
                                    echo "Ejecutando build..."
                                    npm run build
                                else
                                    echo "No hay script de build en package.json, omitiendo este paso"
                                fi

                                echo "TCP_PORT=${deployPort}" > .env

                                if pm2 list | grep -q "${serviceName}"; then
                                    echo "Reiniciando aplicación con PM2..."
                                    pm2 restart ${serviceName}
                                else
                                    echo "Iniciando aplicación con PM2..."
                                    pm2 start dist/main.js --name "${serviceName}" --env production
                                    pm2 save
                                fi

                                echo "Configurando Nginx para ${serviceName} en el puerto ${deployPort} con prefijo /${targetBranch}..."
                                NGINX_CONF_DIR="/etc/nginx/sites-available"
                                NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
                                NGINX_CONF_FILE="\${NGINX_CONF_DIR}/${serviceName}"

                                sudo tee "\${NGINX_CONF_FILE}" > /dev/null <<EOL
server {
    listen 80;
    server_name ${EC2_SERVER};

    location /${targetBranch}/ {
        proxy_pass http://localhost:${deployPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL

                                if [ ! -L "\${NGINX_ENABLED_DIR}/${serviceName}" ]; then
                                    sudo ln -s "\${NGINX_CONF_FILE}" "\${NGINX_ENABLED_DIR}/"
                                fi

                                sudo nginx -t && sudo systemctl reload nginx
                            '
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline ejecutado con éxito!"
        }
        failure {
            echo "El pipeline ha fallado."
        }
    }
}
