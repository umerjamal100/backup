import {Injectable} from '@nestjs/common';
import {AddressDto} from '../users/types/dto/user.dto';
import {AddressModelStructure} from '../schemas/address.schema';

@Injectable()
export class AddressHelper {
  transformAddressFromDTO(address: AddressDto): AddressModelStructure {
    const coordinates = Array.from((address.coordinates as string).split(','), Number).reverse();
    delete address.coordinates;
    address['location'] = {type: 'Point', coordinates};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return address;
  }

  toLngLat(coordinates: string): number[] {
    return Array.from((coordinates as string).split(','), Number).reverse();
  }

  toString(coordinates: number[]) {
    return coordinates.reverse().join(',')
  }
}