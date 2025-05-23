import { Module } from '@nestjs/common';
import { CartGatewayController } from './cart.controller';
import { CartGatewayService } from './cart.service';
import { TcpModule } from '../tcp/tcp.module';


@Module({
  imports: [
    TcpModule,
  ],
  controllers: [CartGatewayController],
  providers: [CartGatewayService],
})
export class CartModule {} 