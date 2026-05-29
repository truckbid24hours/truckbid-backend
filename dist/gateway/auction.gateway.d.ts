import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { AuctionsService } from '../auctions/auctions.service';
export declare class AuctionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private auctionsService;
    private prisma;
    server: Server;
    private intervals;
    private finalizedAuctions;
    constructor(auctionsService: AuctionsService, prisma: PrismaService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    startAuctionCountdown(auctionId: string): void;
    tickCountdown(auctionId: string): Promise<number>;
    finalizeAuction(auctionId: string): Promise<void>;
    handleJoin(client: Socket, data: {
        auctionId: string;
        userId: string;
    }): Promise<void>;
    handleBid(client: Socket, data: {
        auctionId: string;
        userId: string;
        amount: number;
    }): Promise<void>;
}
