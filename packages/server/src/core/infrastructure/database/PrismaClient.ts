import { PrismaClient as BasePrismaClient } from "@prisma/client";

export class PrismaClient {
  private static instance: BasePrismaClient;

  public static getInstance(): BasePrismaClient {
    if (!PrismaClient.instance) {
      PrismaClient.instance = new BasePrismaClient();
    }
    return PrismaClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaClient.instance) {
      await PrismaClient.instance.$disconnect();
    }
  }
}
