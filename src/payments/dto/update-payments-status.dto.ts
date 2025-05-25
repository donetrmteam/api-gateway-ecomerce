import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, Length, Matches, MaxLength } from "class-validator";

export class UpdatePaymentStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de pago',
    example: 'PAGADO',
    enum: ['PENDIENTE', 'PAGADO', 'FALLO'],
  })
  @IsIn(['PENDIENTE', 'PAGADO', 'FALLO'], {
    message: 'El estado debe ser uno de los siguientes: PENDIENTE, PAGADO, FALLO',
  })
  status: string;

   @ApiProperty({
        description: 'Método de pago utilizado',
        example: 'Tarjeta',
    })
    @IsString({ message: 'El método de pago debe ser una cadena de texto' })
    @MaxLength(50, { message: 'El metodo de pago no puede exceder los 50 caracteres' })
    paymentMethod: string;

  @ApiProperty({
        description: 'Numero de tarjeta',
        example: '12542548254932654',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'La tarjeta debe ser una cadena de texto' })    
    @MaxLength(16, { message: 'El número de tarjeta no puede exceder los 16 caracteres' })
    cardNumber?: string;
}
