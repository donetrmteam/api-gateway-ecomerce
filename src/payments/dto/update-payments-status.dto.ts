import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export class UpdatePaymentStatusDto {
    @ApiProperty({
        description: 'Nuevo estado de pago',
        example: 'PAGADO',
        enum: ['PENDIENTE', 'PAGADO', 'FALLO']
    })
    @IsIn(['PENDIENTE', 'PAGADO', 'FALLO'], {
        message: 'El estado debe ser uno de los siguientes : PENDING, PAID, FAILED',
    })
    status: string
}