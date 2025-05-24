import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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