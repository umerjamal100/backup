export enum AddressType {
  Home = "HOME",
  Work = "WORK",
  Pharmacy = "PHARMACY",
  Hospital = "HOSPITAL",
  Clinic = "CLINIC",
  Other = "OTHER"
}

export enum UserRole {
  Admin = "ADMIN",
  SubAdmin = "SUB_ADMIN",
  Administrator = "ADMINISTRATOR",
  Patient = "PATIENT",
  Guest = "GUEST",
  Hospital = "HOSPITAL",
  Pharmacy = "PHARMACY",
  Rider = "RIDER",
  Support = "SUPPORT"
}

export enum ErrorType {
  Validation = "VALIDATION_ERROR",
  UnknownError = "UNKNOWN_ERROR",
  FileUploadError = "FILE_UPLOAD_ERROR",
  Authentication = "AUTHENTICATION_ERROR",
  NotFound = "NOT_FOUND",
}

export enum HttpStatusCode {
  Ok = 200,
  Unauthorized = 401,
  NotFound = 404,
  Unprocessable = 422,
  NotImplemented = 501,
  InternalError = 505,
}

export enum Collection {
  Address = 'address',
  User = 'user',
  Sequence = 'sequence',
  Hospital = 'hospital',
  Department = 'department',
  Doctor = 'doctor',
}

export enum MimeTypes {
  PLAIN = 'text/plain',
  VIDEO_MP4 = 'video/mp4',
  ZIP = 'application/zip',
  JPEG = 'image/jpeg',
  JPG = 'image/jpg',
  PNG = 'image/png',
  PDF = 'application/pdf',
  DOC = 'application/msword',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  EXCEL = 'application/vnd.ms-excel',
  EXCELX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

export const enum ErrorMessage {
  INTEGRATION_BELONGS_TO_ANOTHER_COMPANY = 'Integration belongs to another company!',
  COMPANY_NOT_FOUND = 'Company Not Found!',
  PROJECT_NOT_FOUND = 'Project Not Found!',
  INVITATION_NOT_FOUND = 'Invitation Not Found!',
  GENERIC_FORBIDDEN = 'You do not have necessary permissions to execute this request!',
  WRONG_SLACK_REDIRECT = 'redirectUri must be one of the following: ',
  INTEGRATION_NOT_FOUND = 'Integration Not Found!',
  USER_TOKEN_NOT_FOUND = 'User token not found!',
  UNIQUE_PROJECT_NAME = 'Project Name must be unique!',
  ALREADY_INVITED = 'Already Invited!',
  ALREADY_MEMBER = 'Already Member!',
  INVALID_ID = 'Invalid id!',
  SLACK_FETCH_TOKEN_FAILED = 'Unable to fetch slack token, code or redirectUri is incorrect!',
  INTEGRATION_ALREADY_EXISTS = 'Integration Already Exists for ',
  GENERIC_CONFLICT = 'resource not modified',
  GENERIC_NOT_FOUND = 'resource not found!',
  GENERIC_RESOURCE_DELETED = 'resource deleted!',
  NOT_PROJECT_MEMBER = 'you are not a member of this project',
  USER_NOT_FOUND = 'User Not Found!',
  NOT_PART_OF_PROJECT = 'Given user is not part of the project!',
  CANNOT_REMOVE_YOURSELF = 'You cannot remove yourself!',
  AT_LEAST_ONE_FIELD_IS_NECESSSARY = 'At least one field is necessary to update!',
  EITHER_COMPANY_NOT_FOUND_OR_USER_NOT_ADMIN = 'Either company do not exist or you do no have necessary permissions!',
  ADMIN_CANNOT_UPDATE_ADMIN = 'Admin cannot update another admin!',
  ADMIN_CANNOT_REMOVE_ADMIN = 'Admin cannot remove another admin!',
  ADMIN_OWNER_CANNOT_UPDATE_OWNER = 'Admin/Owner cannot update owner!',
  ONE_OWNER_PER_COMPANY = 'Owner role cannot be assigned to any member!',
  ALREADY_HAVE_A_ROLE = 'Already ?!',
  CANNOT_REMOVE_OWNER = 'You cannot remove owner of company!',
  COMMENT_NOT_FOUND = 'Comment Not Found!',
  POST_NOT_FOUND = 'Post Not Found!',
  INVALID_JWT = 'Invalid jwt token!',
  INVALID_INVITATION_JWT_OR_INVITATION_ID = 'Either jwt token or invitationId is invalid!',
  ALREADY_ACCEPTED = 'Already Accepted!',
  INVITATION_REVOKED = 'Your invitation has been revoked!',
  ACCOUNT_EXISTS = 'Account with given email already exists!',
  REGISTER_FIRST = 'Please signup first to activate your account!',
  ALREADY_VERIFIED = 'Already Verified!',
  UNVERIFIED_USER = 'Unverified Email!',
  INTEGRATION_MISMATCH = 'You have selected incorrect workspace. Allowed workspace: ?',
  INTEGRATION_ONLY_BY_ADMIN = 'Please contact your admin to integrate ? first!',
  REINTEGRATE_APP = 'Please reintegrate ? to add resources!',
  RESOURCE_ALREADY_ADDED = 'Already Exists!',
  UNAUTHORIZED = 'Please Login First!',
  GENERAL_CANNOT_BE_RENAMED = 'You cannot rename General team name!',
  CANNOT_REMOVE_USER_FROM_GENERAL = 'You cannot remove user from General team!',
  CANNOT_ADD_USER_TO_GENERAL = 'You cannot add user to General team!',
  CANNOT_LEAVE_GENERAL = 'You cannot leave team General!',
  GENERAL_NOT_FOUND = 'General team not found!',
  ONE_FIELD_IS_NECESSARY = 'At least one field is required!'
}

export const enum ResponseMessage {
  FORGOT_PASSWORD = 'An email has been sent with reset password instructions! Please check your email!',
  INTEGRATION_SUCCESSFUL = 'Integration Added Successfully!',
  INVITED_SUCCESSFULLY = 'Invited Successfully!',
  DELETED_SUCCESSFULLY = 'Deleted Successfully!',
  ADDED_SUCCESSFULLY = 'Added Successfully!',
  SUCCESS = 'Success!',
  CANNOT_BE_DEFINED_BOTH_USERID_AND_INVITATIONID = 'Both userId and invitationId cannot be null or empty or defined at the same time',
  REGISTER_SUCCESS = 'We have sent you an activation email! Please check your email to activate your account!'
}

