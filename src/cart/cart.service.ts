import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AddToCartGatewayDto } from './dto/add-to-cart.dto';
import { UpdateCartItemGatewayDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartGatewayService implements OnModuleInit {
  private readonly logger = new Logger('CartGatewayService');

  constructor(
    @Inject('CART_SERVICE') private readonly cartServiceClient: ClientProxy,
  ) {}

  async onModuleInit() {
    // await this.cartServiceClient.connect();
  }

  async getCart(userId: string) {
    this.logger.log(`Getting cart for user ${userId}`);
    return firstValueFrom(
      this.cartServiceClient.send({ cmd: 'get_cart' }, { userId }),
    );
  }

  async addItemToCart(userId: string, addToCartDto: AddToCartGatewayDto) {
    const payload = {
      userId,
      product: addToCartDto.product,
    };
    return firstValueFrom(
      this.cartServiceClient.send({ cmd: 'add_item_to_cart' }, payload),
    );
  }

  async updateItemQuantity(
    userId: string,
    updateDto: UpdateCartItemGatewayDto,
  ) {
    const payload = {
      userId,
      productId: updateDto.productId,
      quantity: updateDto.quantity,
    };
    return firstValueFrom(
      this.cartServiceClient.send({ cmd: 'update_item_quantity' }, payload),
    );
  }

  async removeItemFromCart(userId: string, productId: string) {
    return firstValueFrom(
      this.cartServiceClient.send(
        { cmd: 'remove_item_from_cart' },
        { userId, productId },
      ),
    );
  }

  async clearCart(userId: string) {
    return firstValueFrom(
      this.cartServiceClient.send({ cmd: 'clear_cart' }, { userId }),
    );
  }
} 