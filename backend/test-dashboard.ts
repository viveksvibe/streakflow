import { getDashboard } from './src/modules/stats/stats.service.js';
import { prisma } from './src/lib/prisma.js';

async function main() {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log("No user found");
        return;
    }
    console.log("Found user:", user.id);
    try {
        const dashboard = await getDashboard(user.id);
        console.log("Dashboard fetch success");
    } catch(e) {
        console.error("Error fetching dashboard:", e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
