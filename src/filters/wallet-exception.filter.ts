import { Catch, HttpException, HttpStatus } from '@nestjs/common';

@Catch(HttpException)
export class WalletExceptionFilter extends HttpException {
    constructor(status: HttpStatus, msg: string) {
        super(msg, status || HttpStatus.BAD_REQUEST);
    }
}
