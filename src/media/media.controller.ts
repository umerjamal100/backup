import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {MediaService} from './media.service';
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiImplicitFile,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
  ApiUnsupportedMediaTypeResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import {AnyFilesInterceptor, FilesInterceptor} from '@nestjs/platform-express';
import {FileResponseInterface} from '../helpers/interfaces/aws.helper.interface';
import {validate} from 'class-validator';
import {HttpErrors} from '../common/errors';
import {GenericUnauthorizedResponse, InternalServerErrorWithMessage} from '../common/responses.common';
import {Bucket, FilesDto, PharmacyIdQuery} from './types/dto/media.dto';
import {
  MediaBadRequestResponse,
  MediaUnprocessableEntityResponse,
  MediaUnsupportedMediaResponse,
  MediaUploadSuccessResponse,
} from './types/responses/media.response';
import {CSVFileFilter} from '../common/interceptors/files.interceptor';
import {AuthenticatedGuard} from '../auth/guards/Authenticated.guard';

@ApiUseTags('Media')
// @UseGuards(AuthGuard('jwt'))
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {
  }

  @Post('bucket/:bucketName')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiImplicitFile({name: 'files', required: true, description: 'Files to upload!'})
  @ApiCreatedResponse({description: 'OK', type: MediaUploadSuccessResponse})
  @ApiBadRequestResponse({description: 'Missing Parameters or Validation Failed!', type: MediaBadRequestResponse})
  @ApiUnauthorizedResponse({description: HttpErrors.UNAUTHORIZED, type: GenericUnauthorizedResponse})
  @ApiUnsupportedMediaTypeResponse({
    description: HttpErrors.UNSUPPORTED_MEDIA_TYPE,
    type: MediaUnsupportedMediaResponse,
  })
  @ApiUnprocessableEntityResponse({description: 'Upload Size Not Allowed!', type: MediaUnprocessableEntityResponse})
  @ApiInternalServerErrorResponse({
    description: HttpErrors.INTERNAL_SERVER_ERROR,
    type: InternalServerErrorWithMessage,
  })
  async uploadFiles(@UploadedFiles() files, @Param() params: Bucket): Promise<FileResponseInterface> {
    const data = new FilesDto(files);
    const errors = await validate(data);
    if (errors && errors.length) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: HttpErrors.BAD_REQUEST,
        message: errors,
      });
    }
    return this.mediaService.uploadFiles(files, params.bucketName);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('docs')
  async getMyIdCard(@Req() req): Promise<string> {
    return this.mediaService.getDocuments(req.user);
  }

  // @UseGuards(AuthGuard('admin'))
  @Post('otcLists')
  @UseInterceptors(FilesInterceptor('files', 1, {fileFilter: CSVFileFilter}))
  @ApiConsumes('multipart/form-data')
  @ApiImplicitFile({name: 'files', required: true, description: 'Files to upload!'})
  @ApiCreatedResponse({description: 'OK', type: MediaUploadSuccessResponse})
  @ApiBadRequestResponse({description: 'Missing Parameters or Validation Failed!', type: MediaBadRequestResponse})
  @ApiUnauthorizedResponse({description: HttpErrors.UNAUTHORIZED, type: GenericUnauthorizedResponse})
  @ApiUnsupportedMediaTypeResponse({
    description: HttpErrors.UNSUPPORTED_MEDIA_TYPE,
    type: MediaUnsupportedMediaResponse,
  })
  @ApiUnprocessableEntityResponse({description: 'Upload Size Not Allowed!', type: MediaUnprocessableEntityResponse})
  @ApiInternalServerErrorResponse({
    description: HttpErrors.INTERNAL_SERVER_ERROR,
    type: InternalServerErrorWithMessage,
  })
  async uploadOTCList(@UploadedFiles() files, @Query() query: PharmacyIdQuery): Promise<any> {
    return this.mediaService.uploadCSVToMongo(files, query.pharmacyId);
  }
}
