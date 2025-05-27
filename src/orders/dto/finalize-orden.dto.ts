import { ApiProperty } from '@nestjs/swagger';

export class FinalizeOrderDto {
  @ApiProperty({
    description: 'Número de tarjeta de crédito o débito',
    example: '1234567890123456',
  })
  cardNumber: string;

  @ApiProperty({
    description: 'Método de pago',
    example: 'Tarjeta',
  })
  paymentMethod: string;
} 