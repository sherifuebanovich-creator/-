import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    rovxUser?: {
      id: string;
      email: string;
      username: string;
      displayName: string;
      avatar?: string;
      role: string;
      subscription: string;
      preferredLang?: string;
      preferredVehicle?: string;
      driverScore?: number;
      reputation?: number;
      totalTrips?: number;
      totalDistance?: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    rovxUser?: {
      id: string;
      email: string;
      username: string;
      displayName: string;
      avatar?: string;
      role: string;
      subscription: string;
      preferredLang?: string;
      preferredVehicle?: string;
      driverScore?: number;
      reputation?: number;
      totalTrips?: number;
      totalDistance?: number;
    };
  }
}
