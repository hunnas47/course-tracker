import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connection = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(connection);
const prisma = new PrismaClient({ adapter });

async function main() {
    const adminUsername = 'admin';
    const adminPassword = 'adminpassword';

    const existingAdmin = await prisma.user.findUnique({
        where: { username: adminUsername },
    });

    if (!existingAdmin) {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(adminPassword, salt);

        await prisma.user.create({
            data: {
                username: adminUsername,
                passwordHash,
                role: Role.ADMIN,
            },
        });
        console.log('Admin created successfully');
    } else {
        console.log('Admin already exists');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
