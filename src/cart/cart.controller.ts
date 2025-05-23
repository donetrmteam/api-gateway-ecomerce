import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartGatewayService } from './cart.service';
import { AddToCartGatewayDto } from './dto/add-to-cart.dto';
import { UpdateCartItemGatewayDto } from './dto/update-cart-item.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('cart')
@ApiBearerAuth() 
@UseGuards(JwtAuthGuard) 
@Controller('cart')
export class CartGatewayController {
  constructor(private readonly cartGatewayService: CartGatewayService) {}

  private getUserIdFromRequest(req: any): string {
    return req.user.userId;
  }

  @Get()
  @ApiOperation({ summary: 'Obtener el carrito del usuario actual' })
  getCart(@Req() req: any) {
    const userId = this.getUserIdFromRequest(req);
    return this.cartGatewayService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Agregar un ítem al carrito' })
  @ApiResponse({ status: 200, description: 'Ítem agregado al carrito exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  addItemToCart(
    @Req() req: any,
    @Body() addToCartDto: AddToCartGatewayDto,
  ) {
    const userId = this.getUserIdFromRequest(req);
    return this.cartGatewayService.addItemToCart(userId, addToCartDto);
  }

  @Patch('items')
  @ApiOperation({ summary: 'Actualizar la cantidad de un ítem en el carrito' })
  updateItemQuantity(
    @Req() req: any,
    @Body() updateCartItemDto: UpdateCartItemGatewayDto,
  ) {
    const userId = this.getUserIdFromRequest(req);
    return this.cartGatewayService.updateItemQuantity(userId, updateCartItemDto);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Eliminar un ítem del carrito' })
  removeItemFromCart(
    @Req() req: any,
    @Param('productId') productId: string,
  ) {
    const userId = this.getUserIdFromRequest(req);
    return this.cartGatewayService.removeItemFromCart(userId, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Vaciar el carrito del usuario actual' })
  clearCart(@Req() req: any) {
    const userId = this.getUserIdFromRequest(req);
    return this.cartGatewayService.clearCart(userId);
  }
} 