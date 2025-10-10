export interface IPasswordHashServiceHashInput {
  password: string;
}

export interface IPasswordHashServiceHashOutput {
  hash: string;
}

export interface IPasswordHashServiceVerifyInput {
  password: string;
  hash: string;
}

export interface IPasswordHashServiceVerifyOutput {
  isValid: boolean;
}

export interface IPasswordHashService {
  hash(
    input: IPasswordHashServiceHashInput
  ): Promise<IPasswordHashServiceHashOutput>;
  verify(
    input: IPasswordHashServiceVerifyInput
  ): Promise<IPasswordHashServiceVerifyOutput>;
}
