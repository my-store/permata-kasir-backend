import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma, Produk } from "models";

@Injectable()
export class ProdukService {
    private readonly findAllKeys: Prisma.ProdukSelect = {
        id: true,
        nama: true,
        hargaPokok: true,
        hargaJual: true,
        createdAt: true,
        updatedAt: true,

        // toko: {
        //     select: {
        //         nama: true,
        //         alamat: true,
        //         tlp: true,
        //     },
        // },
    };

    private readonly findOneKeys: Prisma.ProdukSelect = {
        id: true,
        nama: true,
        hargaPokok: true,
        hargaJual: true,
        stok: true,
        createdAt: true,
        updatedAt: true,

        toko: {
            select: {
                id: true,
                nama: true,
                alamat: true,
                tlp: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        nama: true,
                        tlp: true,
                        alamat: true,
                        createdAt: true,
                    },
                },
            },
        },

        diskon: {
            select: {
                id: true,
                keterangan: true,
                createdAt: true,
            },
        },
    };

    constructor(private readonly prisma: PrismaService) {}

    async create(data: any): Promise<Produk> {
        let newData: Prisma.ProdukCreateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        newData.createdAt = thisTime;
        newData.updatedAt = thisTime;

        // Save a new data
        return this.prisma.produk.create({ data: newData });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: Prisma.ProdukSelect;
        cursor?: Prisma.ProdukWhereUniqueInput;
        where?: Prisma.ProdukWhereInput;
        orderBy?: Prisma.ProdukOrderByWithRelationInput;
    }): Promise<Produk[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.produk.findMany({
            skip,
            take,
            select: {
                ...this.findAllKeys,
                ...select,
            },
            cursor,
            where,
            orderBy,
        });
    }

    async findOne(params: {
        select?: Prisma.ProdukSelect;
        where: Prisma.ProdukWhereUniqueInput;
    }): Promise<Produk | null> {
        const { select, where } = params;
        return this.prisma.produk.findUnique({
            select: { ...this.findOneKeys, ...select },
            where,
        });
    }

    async update(
        where: Prisma.ProdukWhereUniqueInput,
        data: any,
    ): Promise<Produk> {
        let updatedData: Prisma.ProdukUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.produk.update({ where, data: updatedData });
    }

    async remove(where: Prisma.ProdukWhereUniqueInput): Promise<Produk> {
        return this.prisma.produk.delete({ where });
    }
}
