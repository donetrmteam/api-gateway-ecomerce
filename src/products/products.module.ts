import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { TcpModule } from '../tcp/tcp.module';

@Module({
  imports: [TcpModule],
  controllers: [ProductsController],
})
export class ProductsModule {}