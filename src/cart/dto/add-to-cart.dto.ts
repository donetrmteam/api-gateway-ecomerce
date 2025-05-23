import { IsNotEmpty, IsString, IsNumber, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';


class ProductDetailsDto {
  @ApiProperty({ description: 'ID del producto', example: 'uuid-del-producto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Cantidad del producto', example: 1, minimum: 1 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Precio del producto en el momento de agregarlo', example: 99.99 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Nombre del producto', example: 'Laptop XYZ' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class AddToCartGatewayDto {
  @ApiProperty({ type: () => ProductDetailsDto, description: 'Detalles del producto a agregar' })
  @ValidateNested()
  @Type(() => ProductDetailsDto)
  product: ProductDetailsDto;
} 