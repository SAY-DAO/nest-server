export class CreateSignatureDto {
    verifyContractAddress: string
    chainId: string;
    signerAddress: string;
    needId: number;
    userId: number;
    impacts: number
}

