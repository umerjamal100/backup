import {Injectable, UnprocessableEntityException} from "@nestjs/common";

@Injectable()
export class ErrorUtils {

  errorHandler(error: {status: number, message: string}) {
    console.error(error)
    if (!error.status) throw Error()
    if (error.status === 422) throw new UnprocessableEntityException(error.message)
  }
}