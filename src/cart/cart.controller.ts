import {Body, Controller, Delete, Get, Patch, Post, Query, Req, UseGuards} from '@nestjs/common';
import {CartService} from './cart.service';
import {AuthenticatedGuard} from '../auth/guards/Authenticated.guard';
import {CartModelInterface, CartModelStructure} from '../schemas/cart.schema';
import {CartIdtDTO, CreateCartDTO, DeleteFromCartDTO, UpdateCartDTO} from './types/dto/cart.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import {CreateCartResponse} from './types/responses/cart.responses';
import {BadRequest, InternalServerError} from '../common/responses.common';
import {CartCheckoutInterface} from "./types/interfaces/cart.interface";

@ApiUseTags('Cart')
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {
  }

  @UseGuards(AuthenticatedGuard)
  @ApiCreatedResponse({type: CreateCartResponse})
  @ApiBadRequestResponse({type: BadRequest})
  @ApiInternalServerErrorResponse({type: InternalServerError})
  @Post()
  async createCart(@Body() body: CreateCartDTO, @Req() req): Promise<CartModelInterface> {
    return this.cartService.create({...body, user: req.user._id});
  }

  @UseGuards(AuthenticatedGuard)
  @ApiCreatedResponse({type: CreateCartResponse})
  @ApiBadRequestResponse({type: BadRequest})
  @ApiInternalServerErrorResponse({type: InternalServerError})
  @Patch()
  async updateCart(@Body() body: UpdateCartDTO, @Req() req): Promise<CartModelStructure> {
    return this.cartService.update(body);
  }

  @UseGuards(AuthenticatedGuard)
  @ApiCreatedResponse({type: CreateCartResponse})
  @ApiBadRequestResponse({type: BadRequest})
  @ApiInternalServerErrorResponse({type: InternalServerError})
  @Delete()
  async deleteFromCart(@Body() body: DeleteFromCartDTO, @Req() req): Promise<CartModelInterface> {
    return this.cartService.delete(body);
  }

  @UseGuards(AuthenticatedGuard)
  @Get()
  async getOneCart(@Query() query: CartIdtDTO, @Req() req): Promise<CartModelInterface> {
    return this.cartService.findOneById(query.cartId);
  }

  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({type: CreateCartResponse})
  @ApiBadRequestResponse({type: BadRequest})
  @ApiInternalServerErrorResponse({type: InternalServerError})
  @Get('myCart')
  async getMyCart(@Req() req): Promise<CartModelInterface> {
    return this.cartService.findOne({user: req.user._id});
  }

  // @UseGuards(AuthenticatedGuard)
  @ApiCreatedResponse({type: CreateCartResponse})
  @ApiBadRequestResponse({type: BadRequest})
  @ApiInternalServerErrorResponse({type: InternalServerError})
  @Patch('checkout')
  async confirmCart(@Body() body: CartIdtDTO, @Req() req): Promise<CartCheckoutInterface> {
    return this.cartService.confirmCart(body.cartId, req.user);
  }
}
