import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FinalizeOrderDto {
  @ApiProperty({
    description: 'Número de tarjeta de crédito o débito',
    example: '4234567890123456',
  })
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @ApiProperty({
    description: 'Método de pago',
    example: 'Tarjeta',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
} 