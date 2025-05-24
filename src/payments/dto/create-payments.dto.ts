import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, IsUUID, Min, MaxLength, IsIn } from 'class-validator';

export class CreatePaymentDto {
    @ApiProperty({
        description: 'ID de la orden relacionada',
        example: '34e4567-e89b-12d3-a456-426614174def',
    })
    @IsUUID('4', { message: 'orderId debe ser un UUID válido' })
    orderId: string;

    @ApiProperty({
        description: 'ID del usuario que realiza el pago',
        example: 'c56e4567-e89b-12d3-a456-426614174ghi',
    })
    @IsUUID('4', { message: 'userId debe ser un UUID válido' })
    userId: string;

    @ApiProperty({
        description: 'Monto del pago',
        example: 100.50,
    })
    @IsNumber({maxDecimalPlaces: 10}, { message: 'El monto de pago debe ser un número' })
    @Min(0, { message: 'El monto debe ser mayor a 0' })
    amount: number;

    @ApiProperty({
        description: 'Método de pago utilizado',
        example: 'Tarjeta',
    })
    @IsString({ message: 'El método de pago debe ser una cadena de texto' })
    @MaxLength(50, { message: 'El metodo de pago no puede exceder los 50 caracteres' })
    paymentMethod: string;

    @ApiProperty({
        description: 'Estado del pago',
        example: 'PAID',
        enum: ['PENDING', 'PAID', 'FAILED'],
    })
    @IsIn(['PENDING', 'PAID', 'FAILED'], { message: 'El estado debe ser uno de los siguientes: PENDING, PAID, FAILED' })
    status: string;

    @ApiProperty({
        description: 'ID de la transacción asociada al pago',
        example: 'tx_1234567890',
    })
    @IsOptional()
    @IsString({ message: 'El ID de la transacción debe ser una cadena de texto' })    
    @MaxLength(100, { message: 'El ID de la transacción no puede exceder los 100 caracteres' })
    transactionId?: string;
}