import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCT_SERVICE_HOST || 'localhost',
          port: process.env.PRODUCT_SERVICE_PORT ? parseInt(process.env.PRODUCT_SERVICE_PORT) : 3002,
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST || 'localhost',
          port: process.env.USER_SERVICE_PORT ? parseInt(process.env.USER_SERVICE_PORT) : 3001,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class TcpModule {}