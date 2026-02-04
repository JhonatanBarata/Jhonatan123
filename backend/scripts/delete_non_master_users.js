const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run(){
  try{
    const MASTER_EMAIL = process.env.MASTER_EMAIL || 'jbinformatica1100@gmail.com';
    console.log('Master email from env:', MASTER_EMAIL);
    const users = await prisma.user.findMany();
    const remove = users.filter(u => String(u.email).toLowerCase() !== String(MASTER_EMAIL).toLowerCase());
    for (const u of remove){
      console.log('Deleting user:', u.email, 'id=', u.id);
      await prisma.user.delete({ where: { id: u.id } });
    }
    console.log('Deleted', remove.length, 'users.');
    process.exit(0);
  }catch(e){
    console.error(e);
    process.exit(2);
  }finally{
    await prisma.$disconnect();
  }
}

run();
