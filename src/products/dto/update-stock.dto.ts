import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateStockDto {
  @ApiProperty({
    description: 'Cantidad a actualizar (positiva para agregar, negativa para reducir)',
    example: 10
  })
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  quantity: number;
} 