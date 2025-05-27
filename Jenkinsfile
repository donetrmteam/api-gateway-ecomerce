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
        PORT_QA = '3001'
        PORT_MAIN = '3002'
        NGINX_CONFIG_DIR = '/etc/nginx/conf.d'
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
                    def nginxPrefix = ''

                    if (targetBranch == 'dev') {
                        deployPort = env.PORT_DEV
                        serviceName = 'user-service-dev'
                        nginxPrefix = '/dev'
                    } else if (targetBranch == 'qa') {
                        deployPort = env.PORT_QA
                        serviceName = 'user-service-qa'
                        nginxPrefix = '/qa'
                    } else if (targetBranch == 'main') {
                        deployPort = env.PORT_MAIN
                        serviceName = 'user-service-prod'
                        nginxPrefix = '/prod'
                    } else {
                        echo "No se desplegará la rama: ${targetBranch}"
                        return
                    }

                    withCredentials([sshUserPrivateKey(credentialsId: 'ssh-key-lucas', keyFileVariable: 'SSH_KEY')]) {
                        sh """
                            ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${DEPLOY_USER}@${EC2_SERVER} '
                                # Actualizar repositorios e instalar Nginx si no está presente
                                sudo apt update && sudo apt upgrade -y
                                if ! command -v nginx &> /dev/null; then
                                    sudo apt install -y nginx
                                fi

                                # Crear una única configuración de Nginx para todos los servicios
                                sudo tee /etc/nginx/conf.d/api-gateway.conf << "NGINXEOF"
server {
    listen 80;
    server_name _;

    # Configuración para desarrollo
    location /dev {
        proxy_pass http://localhost:${env.PORT_DEV};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Configuración para QA
    location /qa {
        proxy_pass http://localhost:${env.PORT_QA};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Configuración para producción
    location /prod {
        proxy_pass http://localhost:${env.PORT_MAIN};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Ruta por defecto que redirige a producción
    location / {
        proxy_pass http://localhost:${env.PORT_MAIN};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINXEOF

                                # Eliminar configuraciones antiguas y mantener solo la nueva
                                sudo rm -f /etc/nginx/conf.d/user-service-*.conf
                                sudo rm -f /etc/nginx/sites-enabled/user-service-*

                                # Verificar y recargar configuración de Nginx
                                sudo nginx -t && sudo systemctl reload nginx

                                # Instalar NVM si no existe
                                export NVM_DIR="\\$HOME/.nvm"
                                if [ ! -d "\\$NVM_DIR" ]; then
                                    echo "Instalando NVM..."
                                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
                                fi

                                # Cargar NVM
                                [ -s "\\$NVM_DIR/nvm.sh" ] && \\. "\\$NVM_DIR/nvm.sh"
                                [ -s "\\$NVM_DIR/bash_completion" ] && \\. "\\$NVM_DIR/bash_completion"

                                # Instalar Node LTS
                                echo "Instalando Node.js LTS..."
                                nvm install --lts
                                nvm use --lts

                                # Verificar versiones
                                node --version
                                npm --version

                                # Instalar PM2 globalmente
                                npm install -g pm2
                                pm2 --version

                                # Configurar PM2 para inicio automático
                                pm2 startup | tail -n 1 | bash

                                # Instalar Git si no está presente
                                if ! command -v git &> /dev/null; then
                                    sudo apt install -y git
                                fi

                                # Crear directorio específico para la rama
                                APP_BRANCH_DIR="${APP_DIR}-${targetBranch}"
                                
                                # Clonar o actualizar repositorio
                                if [ ! -d \\$APP_BRANCH_DIR ]; then
                                    echo "Clonando repositorio..."
                                    git clone -b ${targetBranch} ${env.APP_REPO_URL} \\$APP_BRANCH_DIR
                                else
                                    echo "Actualizando repositorio..."
                                    cd \\$APP_BRANCH_DIR
                                    git fetch --all
                                    git checkout ${targetBranch}
                                    git pull origin ${targetBranch}
                                fi

                                # Cargar NVM en el entorno de ejecución
                                export NVM_DIR="\\$HOME/.nvm"
                                [ -s "\\$NVM_DIR/nvm.sh" ] && \\. "\\$NVM_DIR/nvm.sh"
                                nvm use --lts

                                # Instalar dependencias
                                cd \\$APP_BRANCH_DIR
                                npm ci

                                # Compilar la aplicación NestJS
                                if grep -q "\\\\"build\\\\"" package.json; then
                                    echo "Ejecutando build..."
                                    npm run build
                                else
                                    echo "No hay script de build en package.json, omitiendo este paso"
                                fi

                                # Crear archivo de configuración del entorno solo si no existe
                                if [ ! -f .env ]; then
                                    echo "Creando archivo .env inicial..."
                                    echo "TCP_PORT=${deployPort}" > .env
                                else
                                    echo "Archivo .env ya existe, manteniendo configuración actual"
                                fi

                                # Reiniciar o iniciar con PM2
                                if pm2 list | grep -q "${serviceName}"; then
                                    echo "Reiniciando aplicación con PM2..."
                                    pm2 restart ${serviceName}
                                else
                                    echo "Iniciando aplicación con PM2 por primera vez..."
                                    pm2 start dist/main.js --name "${serviceName}" --env production
                                fi

                                # Guardar configuración de PM2
                                pm2 save
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