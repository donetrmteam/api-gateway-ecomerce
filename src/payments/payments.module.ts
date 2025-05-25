import { Module } from "@nestjs/common";
import { TcpModule } from "../tcp/tcp.module";
import { PaymentsController } from "./payments.controller";

@Module({
    imports: [TcpModule],
    controllers: [PaymentsController]
})
export class PaymentModule {}