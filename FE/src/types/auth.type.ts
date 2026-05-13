export type Tokens = {
  token: string;
  refreshToken: string;
  refreshTokenExpiryTime: string;
};

export type Payload = {
  nameidentifier: string;
  email: string;
  fullName: string;
  ipAddress: string;
  avatarUrl: string;
  mobilephone: string;
  exp: number;
  iss: string;
  aud: string;
};
