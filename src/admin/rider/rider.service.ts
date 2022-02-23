import {Injectable} from '@nestjs/common';
import {RiderModelStructure} from "../../schemas/rider.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {ResponseUtils} from "../../helpers/utils/response.utils";
import {PaginationResponse} from "../../common/responses.common";

@Injectable()
export class RiderService {
  constructor(
    @InjectModel('Rider')
    private readonly riderModel: Model<RiderModelStructure>,
    private readonly responseUtils: ResponseUtils,
  ) {
  }

  async getRiders({limit, state, online, ...other}): Promise<PaginationResponse> {
    const condition: any = [
      {...((online === "false" || online === "true") && {isOnline: online === "true"})}
    ]
    if (state)
      condition.push({state})

    const riders = await this.riderModel
      .find({
        $or: condition
      })
      .skip(Number(other.cursor) ?? 0)
      .limit(limit + 1)
      .lean();

    const totalCount = await this.riderModel.find({}).count();

    return this.responseUtils.offsetPaginationResponse(
      riders.map((o) => ({...o, to: null})),
      limit,
      Number(other.cursor) || 1 * limit,
      totalCount,
    );
  }

}
