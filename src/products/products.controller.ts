import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseGuards, Inject, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productServiceClient: ClientProxy
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Producto creado exitosamente' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productServiceClient.send(
      { cmd: 'create_product' }, 
      { createProductDto }
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all products with optional filtering', 
    description: 'Obtiene todos los productos con posibilidad de filtrar por categoría y/o nombre'
  })
  @ApiQuery({ name: 'categoria', required: false, description: 'Filtrar por categoría de producto' })
  @ApiQuery({ name: 'nombre', required: false, description: 'Filtrar por nombre de producto' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de productos' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async findAll(@Query() query: any) {
    return this.productServiceClient.send(
      { cmd: 'find_all_products' }, 
      { filters: query }
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Producto encontrado' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Producto no encontrado' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async findOne(@Param('id') id: string) {
    return this.productServiceClient.send(
      { cmd: 'find_product_by_id' }, 
      { id }
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Producto actualizado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Producto no encontrado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productServiceClient.send(
      { cmd: 'update_product' }, 
      { id, updateProductDto }
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Producto eliminado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Producto no encontrado' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async remove(@Param('id') id: string) {
    return this.productServiceClient.send(
      { cmd: 'remove_product' }, 
      { id }
    );
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update product stock', 
    description: 'Actualiza el stock de un producto (aumentar o reducir)'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Stock actualizado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Producto no encontrado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cantidad inválida o stock insuficiente' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado' })
  async updateStock(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.productServiceClient.send(
      { cmd: 'update_product_stock' }, 
      { id, quantity: updateStockDto.quantity }
    );
  }
}