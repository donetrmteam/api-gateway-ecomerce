import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { TcpModule } from '../tcp/tcp.module';

@Module({
  imports: [TcpModule],
  controllers: [UsersController],
})
export class UsersModule {}