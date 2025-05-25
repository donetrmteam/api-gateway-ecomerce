import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
dotenv.config();

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
      {
        name: 'CART_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.CART_SERVICE_HOST || 'localhost',
          port: process.env.CART_SERVICE_PORT ? parseInt(process.env.CART_SERVICE_PORT) : 3003,
        },
      },
      {
        name: 'ORDER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ORDER_SERVICE_HOST || 'localhost',
          port: process.env.ORDER_SERVICE_PORT ? parseInt(process.env.ORDER_SERVICE_PORT) : 3004,
        },
      },
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PAYMENT_SERVICE_HOST || 'localhost',
          port: process.env.PAYMENT_SERVICE_PORT ? parseInt(process.env.PAYMENT_SERVICE_PORT): 3005
        },
      }
    ]),
  ],
  exports: [ClientsModule],
})
export class TcpModule {}