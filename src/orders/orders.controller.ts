import { Controller, Get, Post, Body, Param, UseGuards, Inject, HttpStatus, Patch, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../decorators/user.decorator';
import { firstValueFrom, timeout, catchError } from 'rxjs';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  private readonly logger = new Logger('OrdersController');

  constructor(
    @Inject('ORDER_SERVICE') private readonly orderServiceClient: ClientProxy,
    @Inject('CART_SERVICE') private readonly cartServiceClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private readonly paymentServiceClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva orden a partir del carrito del usuario' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Orden creada exitosamente' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Carrito vacío o no encontrado' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async create(@User() user: any) {
    try {
      this.logger.log(`Creating order for user ${user.userId}`);
      
      const cart = await firstValueFrom(
        this.cartServiceClient.send(
          { cmd: 'get_cart' },
          { userId: user.userId }
        ).pipe(
          timeout(5000),
          catchError(error => {
            this.logger.error(`Error getting cart: ${JSON.stringify(error)}`);
            throw error;
          })
        )
      );

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new BadRequestException('El carrito está vacío');
      }

      this.logger.log(`Cart found for user ${user.userId}, sending create order request. Cart: ${JSON.stringify(cart)}`);

      const order = await firstValueFrom(
        this.orderServiceClient.send(
          { cmd: 'create_order' },
          { 
            userId: user.userId,
            cart: cart
          }
        ).pipe(
          timeout(5000),
          catchError(error => {
            this.logger.error(`Error in order service: ${JSON.stringify(error)}`);
            throw error;
          })
        )
      );

      this.logger.log(`Order created successfully for user ${user.userId}`);

      const createPaymentDto = {
        orderId: order.id,
        userId: user.userId,
        amount: order.total,
        paymentMethod: 'Tarjeta',
        status: 'PENDIENTE',         
        cardNumber: '4234567891236547',
      };

      const paymentResult = await firstValueFrom(
      this.paymentServiceClient.send(
        { cmd: 'create_payment' },
        createPaymentDto
      ).pipe(
        timeout(5000),
        catchError(error => {
          this.logger.error(`Error creating payment: ${JSON.stringify(error)}`);
          throw error;
        })
      )
    );

    this.logger.log(`Payment created successfully for order ${order.id}`); 

    return {
      order,
      payment: paymentResult
    }
     
    } catch (error) {
      this.logger.error(`Error creating order: ${JSON.stringify(error)}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error al crear la orden: ${error.message || 'Error desconocido'}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las órdenes del usuario' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de órdenes' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async findAll(@User() user: any) {
    try {
      return await firstValueFrom(
        this.orderServiceClient.send(
          { cmd: 'find_all_orders' },
          { userId: user.userId }
        )
      );
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las órdenes');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una orden específica' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Orden encontrada' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Orden no encontrada' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async findOne(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.orderServiceClient.send(
          { cmd: 'find_order' },
          { id }
        )
      );
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener la orden');
    }
  }

  @Patch(':id/finalize')
  @ApiOperation({ summary: 'Finalizar una orden' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Orden finalizada exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Orden no encontrada' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'La orden no está en estado PENDIENTE' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async finalizeOrder(@Param('id') id: string) {
    try {
      const order = await firstValueFrom(
        this.orderServiceClient.send(
          { cmd: 'finalize_order' },
          { id }
        )
      );

      await firstValueFrom(
        this.paymentServiceClient.send(
          { cmd : 'update_payment_status'},
          {orderId: id, status: 'PAGADO'}
        )
      ); 

      return order;
      
    } catch (error) {
      throw new InternalServerErrorException('Error al finalizar la orden');
    }
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar una orden' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Orden cancelada exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Orden no encontrada' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'La orden no está en estado PENDIENTE' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async cancelOrder(@Param('id') id: string) {
    try {
       await firstValueFrom(
        this.orderServiceClient.send(
          { cmd: 'cancel_order' },
          { id }
        )
      );

      await firstValueFrom(
        this.paymentServiceClient.send(
          { cmd: 'remove_payment_by_order_id'},
          { orderId: id }
        )
      );

      return { message: 'Orden cancelada y pago eliminado'}
    } catch (error) {
      throw new InternalServerErrorException('Error al cancelar la orden');
    }
  }
} 