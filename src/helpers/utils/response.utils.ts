import {Injectable} from '@nestjs/common';

@Injectable()
export class ResponseUtils {
  paginationResponse(data: any[], limit, cursor?) {
    const response = {
      data,
      hasMore: false,
      cursor: '',
    };
    if (data.length > limit) {
      data.splice(-1, 1);
      response.data = data;
      response.hasMore = true;
      response.cursor = cursor ?? data[data.length - 1]._id;
    }
    return response;
  }

  offsetPaginationResponse(data: any[], limit: number, cursor: number, totalCount = 0) {
    const response = {
      data,
      hasMore: false,
      cursor: 0,
      totalCount,
    };
    if (data.length > limit) {
      data.splice(-1, 1);
      response.data = data;
      response.hasMore = true;
      response.cursor = cursor;
    }
    return response;
  }
}
