import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Este DTO es lo que el cliente envía al Gateway para actualizar un ítem
// El userId se añadirá en el servicio/controlador del Gateway a partir del token JWT

export class UpdateCartItemGatewayDto {
  @ApiProperty({ description: 'ID del producto a actualizar', example: 'uuid-del-producto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Nueva cantidad del producto', example: 2, minimum: 1 })
  @IsNumber()
  @IsPositive()
  quantity: number;
} 