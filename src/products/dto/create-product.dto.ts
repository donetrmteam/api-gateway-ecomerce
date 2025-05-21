import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Smartphone XYZ',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Smartphone de última generación con 8GB RAM y 128GB almacenamiento',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 599.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  precio: number;

  @ApiProperty({
    description: 'Stock disponible',
    example: 100,
  })
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @ApiProperty({
    description: 'Categoría del producto',
    example: 'Electrónica',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'La categoría no puede exceder los 50 caracteres' })
  categoria?: string;
}