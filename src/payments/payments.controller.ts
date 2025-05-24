import { Body, Controller, Delete, Get, HttpStatus, Inject, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CreatePaymentDto } from "./dto/create-payments.dto";
import { UpdatePaymentStatusDto } from "./dto/update-payments-status.dto";

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
    constructor(
        @Inject('PAYMENT_SERVICE') private readonly paymentServiceClient: ClientProxy
    ) {}

  @Post()
  //@UseGuards(JwtAuthGuard)
  //@ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo pago' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Pago creado exitosamente' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos'})
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentServiceClient.send(
        { cmd: 'create_payment' },
        { createPaymentDto }
    );
  }



  @Get()
  //@UseGuards(JwtAuthGuard)
  //@ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener todos los pagos',
    description: 'Obtener todos los pagos de los prodcutos'
 })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de pagos' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async findAll() {
    return this.paymentServiceClient.send(
        { cmd: 'find_all_payments' }, 
        {}
    );
  }


  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pago encontrado' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pago no encontrado' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async findOne(@Param('id') id: string) {
    return this.paymentServiceClient.send(
        { cmd: 'find_payment_by_id' },
        { id }
    );
  }

  @Get('/order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search payments by order ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pagos encontrado de la orden' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pagos no encontrados de la orden'})
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado'})
  async findByOrderId(@Param('orderId') orderId: string) {
    return this.paymentServiceClient.send(
        { cmd: 'find_payments_by_order_id' }, 
        { orderId }
    );
  }

  @Get('/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search payment by User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pagos encontrados del usuario' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pagos no encotrados por el usuario' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async findByUserId(@Param('userId') userId: string) {
    return this.paymentServiceClient.send(
        { cmd: 'find_payments_by_user_id' },
        { userId }
    );
  }

  @Patch(':id/status')
  //@UseGuards(JwtAuthGuard)
  //@ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Udate payment status',
    description: 'Actualizar el status del pago' 
})
  @ApiResponse({ status: HttpStatus.OK, description: 'Estado actualizado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pago no encontrado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async updateStatus(@Param('id') id: string, 
  @Body() updateStatusDto: UpdatePaymentStatusDto
  ) {
    return this.paymentServiceClient.send(
        { cmd: 'update_payment_status' }, 
        { id, status: updateStatusDto.status }
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar pago' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pago eliminado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pago no encontrado' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado'})
  async remove(@Param('id') id: string) {
    return this.paymentServiceClient.send(
      { cmd: 'remove_payment' }, 
      { id });
  }



}