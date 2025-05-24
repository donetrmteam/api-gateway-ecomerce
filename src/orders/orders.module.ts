import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { TcpModule } from '../tcp/tcp.module';

@Module({
  imports: [TcpModule],
  controllers: [OrdersController],
})
export class OrdersModule {} 