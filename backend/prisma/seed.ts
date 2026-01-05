import 'dotenv/config';
import { PrismaClient, Role, SubjectName } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connection = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(connection);
const prisma = new PrismaClient({ adapter });

async function main() {
    // Create Admin
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
        console.log('✅ Admin created successfully');
    } else {
        console.log('ℹ️ Admin already exists');
    }

    // Create Subjects
    const subjects = [SubjectName.AQEEDHA, SubjectName.SELF_DEVELOPMENT, SubjectName.TAFSEER];
    for (const name of subjects) {
        await prisma.subject.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    console.log('✅ Subjects created/verified');

    // Create Sample Classes
    const subjectRecords = await prisma.subject.findMany();
    for (const subject of subjectRecords) {
        const existingClasses = await prisma.class.count({ where: { subjectId: subject.id } });
        if (existingClasses === 0) {
            const sampleClasses = [
                { title: `${subject.name} - Introduction`, date: new Date('2026-01-01') },
                { title: `${subject.name} - Chapter 1`, date: new Date('2026-01-08') },
                { title: `${subject.name} - Chapter 2`, date: new Date('2026-01-15') },
                { title: `${subject.name} - Chapter 3`, date: new Date('2026-01-22') },
            ];
            for (const c of sampleClasses) {
                await prisma.class.create({
                    data: { ...c, subjectId: subject.id },
                });
            }
            console.log(`✅ Sample classes created for ${subject.name}`);
        }
    }

    console.log('🎉 Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await connection.end();
    });
