// src/dto/create-order-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderRequestDto {
  @ApiProperty({ description: 'ID del usuario asociado' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Metodo de pago' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ description: 'Numero de la tarjeta' })
  @IsString()
  cardNumber: string;
}
