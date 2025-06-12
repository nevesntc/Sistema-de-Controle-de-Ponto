import database from './connection';

const createTables = async (): Promise<void> => {
  try {
    // Habilitar extensão para UUIDs
    await database.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Tabela de usuários
    await database.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        nome VARCHAR(255) NOT NULL,
        senha VARCHAR(255) NOT NULL,
        cargo VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de registros de ponto
    await database.query(`
      CREATE TABLE IF NOT EXISTS registros_ponto (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        data_hora TIMESTAMP NOT NULL,
        tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índices
    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_registros_ponto_user_id_data_hora 
      ON registros_ponto(user_id, data_hora);
    `);

    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_registros_ponto_data_hora 
      ON registros_ponto(data_hora);
    `);

    // Tabela de sessões de trabalho (para facilitar consultas)
    await database.query(`
      CREATE TABLE IF NOT EXISTS sessoes_trabalho (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        entrada TIMESTAMP NOT NULL,
        saida TIMESTAMP,
        total_horas DECIMAL(5,2),
        data DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índices para sessões_trabalho
    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_sessoes_trabalho_user_id_data 
      ON sessoes_trabalho(user_id, data);
    `);

    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_sessoes_trabalho_data 
      ON sessoes_trabalho(data);
    `);

    // Função para atualizar updated_at automaticamente
    await database.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Triggers para updated_at
    await database.query(`
      DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
      CREATE TRIGGER update_usuarios_updated_at
        BEFORE UPDATE ON usuarios
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await database.query(`
      DROP TRIGGER IF EXISTS update_sessoes_trabalho_updated_at ON sessoes_trabalho;
      CREATE TRIGGER update_sessoes_trabalho_updated_at
        BEFORE UPDATE ON sessoes_trabalho
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('   - Tabelas criadas com sucesso!');
  } catch (error) {
    console.error('   - Erro ao criar tabelas:', error);
    throw error;
  }
};

export default createTables;
