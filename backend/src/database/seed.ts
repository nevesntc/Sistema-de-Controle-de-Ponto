import bcrypt from 'bcryptjs';
import database from './connection';

const seedDatabase = async (): Promise<void> => {
  try {
    // Verificar se já existem usuários
    const existingUsers = await database.query('SELECT COUNT(*) FROM usuarios');
    
    if (existingUsers.rows[0].count > 0) {
      console.log('   - Base de dados já possui usuários. Pulando seed...');
      return;
    }

    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await database.query(`
      INSERT INTO usuarios (email, nome, senha, cargo)
      VALUES ($1, $2, $3, $4)
    `, [
      'admin@ilumeo.com',
      'Administrador',
      hashedPassword,
      'Desenvolvedor'
    ]);

    await database.query(`
      INSERT INTO usuarios (email, nome, senha, cargo)
      VALUES ($1, $2, $3, $4)
    `, [
      'colaborador@ilumeo.com',
      'João Silva',
      hashedPassword,
      'Analista'
    ]);

    console.log('   - Seed executado com sucesso!');
    console.log('   - Usuários criados:');
    console.log('   - admin@ilumeo.com (senha: 123456)');
    console.log('   - colaborador@ilumeo.com (senha: 123456)');
  } catch (error) {
    console.error('   - Erro ao executar seed:', error);
    throw error;
  }
};

export default seedDatabase;
