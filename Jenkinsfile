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
        NGINX_SITES_AVAILABLE = '/etc/nginx/sites-available'
        NGINX_SITES_ENABLED = '/etc/nginx/sites-enabled'
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

        stage('Deploy Application') {
            steps {
                script {
                    def deployPort = ''
                    def serviceName = ''
                    def pathPrefix = ''
                    def targetBranch = env.BRANCH_NAME

                    if (targetBranch == 'dev') {
                        deployPort = env.PORT_DEV
                        serviceName = 'api-gateway-dev'
                        pathPrefix = '/dev'
                    } else if (targetBranch == 'qa') {
                        deployPort = env.PORT_QA
                        serviceName = 'api-gateway-qa'
                        pathPrefix = '/qa'
                    } else if (targetBranch == 'main') {
                        deployPort = env.PORT_MAIN
                        serviceName = 'api-gateway-prod'
                        pathPrefix = '/api'
                    } else {
                        echo "No se desplegará la rama: ${targetBranch}"
                        return
                    }

                    withCredentials([sshUserPrivateKey(credentialsId: 'ssh-key-lucas', keyFileVariable: 'SSH_KEY')]) {
                        sh """
                            # Limpiar known_hosts para evitar conflictos de SSH key
                            ssh-keygen -f '/var/lib/jenkins/.ssh/known_hosts' -R '${EC2_SERVER}' || true
                            
                            ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${DEPLOY_USER}@${EC2_SERVER} '
                                # Actualizar repositorios
                                sudo apt update && sudo apt upgrade -y

                                # Instalar Nginx si no existe
                                if ! command -v nginx &> /dev/null; then
                                    echo "Instalando Nginx..."
                                    sudo apt install -y nginx
                                    sudo systemctl enable nginx
                                    sudo systemctl start nginx
                                fi

                                # Instalar NVM si no existe
                                export NVM_DIR="\$HOME/.nvm"
                                if [ ! -d "\$NVM_DIR" ]; then
                                    echo "Instalando NVM..."
                                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
                                fi

                                # Cargar NVM
                                [ -s "\$NVM_DIR/nvm.sh" ] && \\. "\$NVM_DIR/nvm.sh"
                                [ -s "\$NVM_DIR/bash_completion" ] && \\. "\$NVM_DIR/bash_completion"

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
                                if [ ! -d \${APP_BRANCH_DIR} ]; then
                                    echo "Clonando repositorio..."
                                    git clone -b ${targetBranch} ${env.APP_REPO_URL} \${APP_BRANCH_DIR}
                                else
                                    echo "Actualizando repositorio..."
                                    cd \${APP_BRANCH_DIR}
                                    git fetch --all
                                    git checkout ${targetBranch}
                                    git pull origin ${targetBranch}
                                fi

                                # Cargar NVM en el entorno de ejecución
                                export NVM_DIR="\$HOME/.nvm"
                                [ -s "\$NVM_DIR/nvm.sh" ] && \\. "\$NVM_DIR/nvm.sh"
                                nvm use --lts

                                # Instalar dependencias
                                cd \${APP_BRANCH_DIR}
                                npm ci

                                # Compilar la aplicación NestJS
                                if grep -q "\\\"build\\\"" package.json; then
                                    echo "Ejecutando build..."
                                    npm run build
                                else
                                    echo "No hay script de build en package.json, omitiendo este paso"
                                fi

                                # Crear o actualizar archivo de configuración del entorno
                                echo "TCP_PORT=${deployPort}" > .env

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

        stage('Configure Nginx Reverse Proxy') {
            steps {
                script {
                    def targetBranch = env.BRANCH_NAME

                    if (!(targetBranch in ['dev', 'qa', 'main'])) {
                        echo "No se configurará Nginx para la rama: ${targetBranch}"
                        return
                    }

                    withCredentials([sshUserPrivateKey(credentialsId: 'ssh-key-lucas', keyFileVariable: 'SSH_KEY')]) {
                        sh """
                            # Limpiar known_hosts para evitar conflictos de SSH key
                            ssh-keygen -f '/var/lib/jenkins/.ssh/known_hosts' -R '${EC2_SERVER}' || true
                            
                            ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${DEPLOY_USER}@${EC2_SERVER} '
                                # Crear archivo de configuración consolidado de Nginx
                                sudo tee ${env.NGINX_SITES_AVAILABLE}/api-gateway-consolidated > /dev/null << \"NGINX_CONFIG\"
server {
    listen 80 default_server;
    server_name _;

    # Página por defecto
    location = / {
        return 200 \"API Gateway - Available endpoints: /api (production), /qa (QA), /dev (development)\\n\";
        add_header Content-Type text/plain;
    }

    # Configuración para producción (/api)
    location /api {
        rewrite ^/api(.*) \\\\\\$1 break;
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\\\\$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \\\\\\$host;
        proxy_set_header X-Real-IP \\\\\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\\\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\\\\$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Configuración para QA (/qa)
    location /qa {
        rewrite ^/qa(.*) \\\\\\$1 break;
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\\\\$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \\\\\\$host;
        proxy_set_header X-Real-IP \\\\\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\\\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\\\\$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Configuración para desarrollo (/dev)
    location /dev {
        rewrite ^/dev(.*) \\\\\\$1 break;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\\\\$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \\\\\\$host;
        proxy_set_header X-Real-IP \\\\\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\\\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\\\\$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Health checks
    location /api/health {
        proxy_pass http://127.0.0.1:3002/health;
        proxy_set_header Host \\\\\\$host;
        proxy_set_header X-Real-IP \\\\\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\\\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\\\\$scheme;
    }

    location /qa/health {
        proxy_pass http://127.0.0.1:3001/health;
        proxy_set_header Host \\\\\\$host;
        proxy_set_header X-Real-IP \\\\\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\\\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\\\\$scheme;
    }

    location /dev/health {
        proxy_pass http://127.0.0.1:3000/health;
        proxy_set_header Host \\\\\\$host;
        proxy_set_header X-Real-IP \\\\\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\\\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\\\\$scheme;
    }

    # Logs
    access_log /var/log/nginx/api_gateway_access.log;
    error_log /var/log/nginx/api_gateway_error.log;
}
NGINX_CONFIG

                                # Remover configuraciones anteriores
                                sudo rm -f ${env.NGINX_SITES_ENABLED}/*

                                # Habilitar la configuración consolidada
                                sudo ln -sf ${env.NGINX_SITES_AVAILABLE}/api-gateway-consolidated ${env.NGINX_SITES_ENABLED}/

                                # Verificar configuración de Nginx
                                echo \"Verificando configuración de Nginx...\"
                                sudo nginx -t

                                if [ \\$? -eq 0 ]; then
                                    echo \"Configuración de Nginx válida. Recargando...\"
                                    sudo systemctl reload nginx
                                    echo \"Nginx recargado exitosamente\"
                                else
                                    echo \"Error en la configuración de Nginx\"
                                    sudo nginx -T
                                    exit 1
                                fi

                                # Verificar estado de los servicios
                                echo \"Estado de Nginx:\"
                                sudo systemctl status nginx --no-pager -l

                                echo \"Estado de PM2:\"
                                pm2 status

                                echo \"Configuración completada para ${targetBranch}\"
                                echo \"Endpoints disponibles:\"
                                echo \"- http://${env.EC2_SERVER}/api (producción)\"
                                echo \"- http://${env.EC2_SERVER}/qa (QA)\"
                                echo \"- http://${env.EC2_SERVER}/dev (desarrollo)\"
                            '
                        """
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    def pathPrefix = ''
                    def targetBranch = env.BRANCH_NAME

                    if (targetBranch == 'dev') {
                        pathPrefix = '/dev'
                    } else if (targetBranch == 'qa') {
                        pathPrefix = '/qa'
                    } else if (targetBranch == 'main') {
                        pathPrefix = '/api'
                    } else {
                        echo "No se verificará el despliegue para la rama: ${targetBranch}"
                        return
                    }

                    // Verificar que el servicio responda
                    sh """
                        echo "Esperando a que el servicio esté disponible..."
                        sleep 15
                        
                        echo "Verificando endpoint: http://${env.EC2_SERVER}${pathPrefix}"
                        HTTP_CODE=\$(curl -f -s -o /dev/null -w "%{http_code}" http://${env.EC2_SERVER}${pathPrefix} || echo "000")
                        echo "HTTP Status Code: \$HTTP_CODE"
                        
                        if [ "\$HTTP_CODE" = "200" ] || [ "\$HTTP_CODE" = "404" ]; then
                            echo "Servicio respondiendo correctamente"
                        else
                            echo "Warning: Servicio puede no estar respondiendo correctamente"
                        fi
                    """
                }
            }
        }
    }

    post {
        success {
            script {
                def pathPrefix = ''
                def targetBranch = env.BRANCH_NAME

                if (targetBranch == 'dev') {
                    pathPrefix = '/dev'
                } else if (targetBranch == 'qa') {
                    pathPrefix = '/qa'
                } else if (targetBranch == 'main') {
                    pathPrefix = '/api'
                }

                echo "¡Pipeline ejecutado con éxito!"
                echo "API Gateway desplegado en: http://${env.EC2_SERVER}${pathPrefix}"
                echo "Todos los endpoints disponibles:"
                echo "- http://${env.EC2_SERVER}/api (producción)"
                echo "- http://${env.EC2_SERVER}/qa (QA)"
                echo "- http://${env.EC2_SERVER}/dev (desarrollo)"
            }
        }
        failure {
            echo "El pipeline ha fallado. Revisa los logs para más detalles."
        }
        always {
            // Limpiar archivos temporales
            sh 'rm -rf app'
        }
    }
}